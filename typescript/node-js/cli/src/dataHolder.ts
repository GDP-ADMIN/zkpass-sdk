/*
 * dataHolder.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023
 * -----
 * Last Modified: November 29th 2023
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
import { ZkPassClient } from "@didpass/zkpass-client-ts";

export class DataHolder {
  public async getProofToken(
    userDataToken: string,
    dvrToken: string
  ): Promise<string> {
    const ZKPASS_SERVICE_URL: string = "https://playground-zkpass.ssi.id/proof";

    try {
      console.log("\n#### starting zkpass proof generation...");
      const start = Date.now();

      //
      //  Data Holder's integration points with the zkpass-client SDK library
      //

      //
      // Step 1: Instantiate the ZkPassClient object.
      //
      const zkpassClient = new ZkPassClient();

      //
      // Step 2: Call the zkpassClient.generateZkpassProof
      //         to get the zkpassProofToken.
      //
      const zkpassProofToken = await zkpassClient.generateZkpassProof(
        ZKPASS_SERVICE_URL,
        userDataToken,
        dvrToken
      );

      const duration = Date.now() - start;
      console.log(`#### generation completed [time=${duration}ms]`);

      return zkpassProofToken;
    } catch (error) {
      console.log("#### DataHolder: error");
      console.log({ error });
    }
  }
}
