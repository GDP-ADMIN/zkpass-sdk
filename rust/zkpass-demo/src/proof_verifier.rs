use crate::constants;
use lazy_static::lazy_static;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::io::prelude::*;
use std::sync::Mutex;
use std::time::Instant;
use tracing::trace;
use uuid::Uuid;
use zkpass_client::core::{
    DataVerificationRequest, KeysetEndpoint, PublicKey, PublicKeyOption, ZkPassError,
};
use zkpass_client::interface::{
    ZkPassClient, ZkPassProofMetadataValidator, ZkPassProofVerifier, ZkPassUtility,
};

//
//  Global table to store the generated DVR values
//  The Verifier needs to keep track of all generated DVRs
//  so that it can verify the proof metadata
//  Note: The hash table entry should have time-expiration
//
lazy_static! {
    static ref DVR_TABLE: Mutex<HashMap<String, DataVerificationRequest>> = {
        let map = HashMap::new();
        Mutex::new(map)
    };
}
struct MyMetadataValidator;

impl MyMetadataValidator {
    fn get_expected_dvr_verifying_key(&self) -> PublicKey {
        let expected_dvr_verifying_key = PublicKey {
            x: String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU"),
            y: String::from("IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="),
        };

        expected_dvr_verifying_key
    }

    fn get_expected_dvr(&self, dvr_id: &str) -> Result<DataVerificationRequest, ZkPassError> {
        //
        //  find the DVR in the table
        //
        let dvr: DataVerificationRequest;
        let mut hash_table = DVR_TABLE.lock().unwrap();
        let removed_item: Option<DataVerificationRequest> = hash_table.remove(dvr_id);
        match removed_item {
            Some(_dvr) => {
                println!("#### found dvr: id={}", _dvr.dvr_id);
                dvr = _dvr;
            }
            None => {
                println!("#### no dvr found for the id");
                return Err(ZkPassError::MismatchedDvrDigest);
            }
        }

        Ok(dvr)
    }
}

impl ZkPassProofMetadataValidator for MyMetadataValidator {
    fn validate(
        &self,
        dvr_id: &str,
    ) -> Result<(DataVerificationRequest, PublicKey, u64), ZkPassError> {
        let expected_ttl: u64 = 600;

        Ok((
            self.get_expected_dvr(dvr_id)?,
            self.get_expected_dvr_verifying_key(),
            expected_ttl,
        ))
    }
}

//
//  Simulating the Proof Verifier
//
pub struct ProofVerifier;

impl ProofVerifier {
    //
    //  Simulating the Proof Verifier's get_dvr_token REST API
    //
    pub fn get_dvr_token(&self, zkvm: &str, dvr_file: &str) -> String {
        const VERIFIER_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
        EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
        PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
        -----END PRIVATE KEY-----";

        let mut query_content = std::fs::File::open(dvr_file).expect("Cannot find the dvr file");
        let mut query = String::new();
        query_content
            .read_to_string(&mut query)
            .expect("Should not have I/O errors");
        trace!("query={}", query);

        let kid = String::from("k-1");
        let jku = String::from(
            "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/verifier-key.json",
        );
        let ep = KeysetEndpoint { jku, kid };
        // issuer's pubkey params:
        let issuer_pubkey = PublicKey {
            x: String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX"),
            y: String::from("8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ=="),
        };
        let query: Value = serde_json::from_str(&query).unwrap();

        //
        //  Proof Verifier's integration points with the zkpass-client SDK library
        //  (for get_dvr_token REST API)
        //

        //
        //  Step 1: Instantiate the zkpass_client object.
        //
        let zkpass_client = ZkPassClient {
            zkpass_api_key: None,
            zkpass_service_url: String::from(""),
            zkvm: String::from(zkvm),
        };

        //
        //  Step 2: Call zkpass_client.get_query_engine_version_info.
        //          The version info is needed for DVR object creation.
        //
        let query_engine_version_info = zkpass_client.get_query_engine_version_info().unwrap();

        //
        // Step 3: Create the DVR object.
        //
        let dvr = DataVerificationRequest {
            zkvm: String::from(zkvm),
            dvr_title: String::from("My DVR"),
            dvr_id: Uuid::new_v4().to_string(),
            query_engine_ver: query_engine_version_info.0,
            query_method_ver: query_engine_version_info.1,
            query: serde_json::to_string(&query).unwrap(),
            user_data_url: Some(String::from("https://hostname/api/user_data/")),
            user_data_verifying_key: PublicKeyOption::PublicKey(issuer_pubkey),
            dvr_verifying_key: None,
        };

        //
        //  Step 4: Call zkpass_client.sign_data_to_jws_token.
        //          to digitally-sign the dvr data.
        //
        let dvr_token = zkpass_client
            .sign_data_to_jws_token(VERIFIER_PRIVKEY, json!(dvr), Some(ep))
            .unwrap();

        //trace!("dvr_token={}", dvr_token);
        // save the dvr to a global hash table
        // this will be needed by the validator to check the proof metadata
        let mut dvr_table = DVR_TABLE.lock().unwrap();
        dvr_table.insert(dvr.dvr_id.clone(), dvr.clone());

        dvr_token
    }

    //
    //  Simulating the Proof Verifier's verify_zkpass_proof REST API
    //
    pub async fn verify_zkpass_proof(&self, zkvm: &str, zkpass_proof_token: &str) -> bool {
        println!("\n#### starting zkpass proof verification...");
        let start = Instant::now();

        let proof_metadata_validator =
            Box::new(MyMetadataValidator) as Box<dyn ZkPassProofMetadataValidator>;

        //
        //  Proof Verifier's integration points with the zkpass-client SDK library
        //  (for verify_zkpass_proof REST API)
        //

        //
        // Step 1: Instantiate the zkpass_client object.
        //
        let zkpass_service_url = constants::ZKPASS_URL;
        let zkpass_client = ZkPassClient {
            zkpass_api_key: None,
            zkpass_service_url: String::from(zkpass_service_url),
            zkvm: String::from(zkvm),
        };

        //
        // Step 2: Call zkpass_client.verify_zkpass_proof to verify the proof.
        //
        let (result, _zkpass_proof) = zkpass_client
            .verify_zkpass_proof(zkpass_proof_token, &proof_metadata_validator)
            .await
            .unwrap();

        let duration = start.elapsed();
        println!("#### verification completed [time={:?}]", duration);

        result
    }
}
