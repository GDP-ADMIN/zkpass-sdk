use std::time::Instant;
//use serde_json::Value;
use zkpass_client::interface::{
    ZkPassClient, ZkPassProofGenerator
};
use crate::data_issuer::DataIssuer;
use crate::proof_verifier::ProofVerifier;

pub struct DataHolder;

impl DataHolder {
    pub async fn start(&self, data_file: &str, dvr_file: &str) {
        //
        //  Get the user data from the data issuer
        //
        let data_issuer = DataIssuer;
        let user_data_token = data_issuer.get_user_data_token(data_file);

        //
        //  Get the dvr from the verifier
        //
        let proof_verifier = ProofVerifier;
        let dvr_token = proof_verifier.get_dvr_token(dvr_file);

        let zkpass_service_url = String::from("https://playground-zkpass.ssi.id/proof");
        //let zkpass_service_url = String::from("http://localhost:10888/proof");
        println!("\n#### starting zkpass proof generation...");
        let start = Instant::now();

        //
        //  Data Holder's integration points with the zkpass-client SDK library
        //

        //
        // Step 1: Instantiate the zkpass_client object.
        //
        let zkpass_client = ZkPassClient;

        //
        // Step 2: Call the zkpass_client.generate_zk_pass_proof
        //         to get the zkpass_proof_token.
        //
        let zkpass_proof_token = zkpass_client
            .generate_zkpass_proof(
                &zkpass_service_url,
                &user_data_token,
                &dvr_token)
            .await.unwrap();

        let duration = start.elapsed();
        println!("#### generation completed [time={:?}]", duration);

        //
        //  Step 3: Send the zkpass_proof_token to the Proof Verifier 
        //          to get the proof verified and retrieve the query result.
        //
        let query_result = proof_verifier
            .verify_zkpass_proof(zkpass_proof_token.as_str());

        println!("the query result is {}", query_result)
    }
}