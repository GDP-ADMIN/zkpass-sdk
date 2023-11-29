/*
 * dataIssuer.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023, 9:07:20 am
 * -----
 * Last Modified: November 27th 2023, 9:07:20 am
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   Nugraha Tejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import fs from "fs";
import { KeysetEndpoint } from "@didpass/zkpass-client-ts/lib/types";
import { ZkPassClient } from "@didpass/zkpass-client-ts";

//
//  Simulating the REST call to the Data Issuer
//
export class DataIssuer {
  //
  // This function simulates the Data Issuer's getUserDataToken REST API
  //
  public async getUserDataToken(dataFile: string): Promise<string> {
    const ISSUER_PRIVKEY: string =
      "-----BEGIN PRIVATE KEY-----\n" +
      "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f\n" +
      "bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx\n" +
      "moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd\n" +
      "-----END PRIVATE KEY-----\n";
    const ENCODING = "utf-8";
    const KID: string = "k-1";
    const JKU: string =
      "https://gdp-admin.github.io/zkpass-sdk/zkpass/sample-jwks/issuer-key.json";

    const data: string = fs.readFileSync(dataFile, ENCODING);
    console.log(`data=${data}`);

    const dataObj: any = JSON.parse(data);

    const issuerPubkey: KeysetEndpoint = { jku: JKU, kid: KID };

    //
    //  Data Issuer's integration points with the zkpass-client SDK library
    //

    //
    // Step 1: Instantiate the zkPassClient object
    //
    const zkPassClient: ZkPassClient = new ZkPassClient();

    //
    // Step 2: Call the zkPassClient.signDataToJwsToken.
    //         This is to digitally-sign the user data.
    //
    const dataToken: string = await zkPassClient.signDataToJwsToken(
      ISSUER_PRIVKEY,
      dataObj,
      issuerPubkey
    );

    return dataToken;
  }
}
