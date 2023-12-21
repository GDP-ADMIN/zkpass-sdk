/*
 * MyIssuer.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023, 9:07:20 am
 * -----
 * Last Modified: December 21st 2023, 9:07:20 am
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
import { Issuer } from "./libs/Issuer";
import { ISSUER_JKU, ISSUER_KID, ISSUER_PRIVKEY } from "./utils/constants";

export class MyIssuer extends Issuer {
  public async getUserDataToken(dataFile: string): Promise<string> {
    const ENCODING = "utf-8";
    const data: string = fs.readFileSync(dataFile, ENCODING);
    console.log(`data=${data}`);

    const dataObj: any = JSON.parse(data);

    const issuerPubkey: KeysetEndpoint = { jku: ISSUER_JKU, kid: ISSUER_KID };

    //
    // Step 1: Sign the user data
    //         using the issuer's private key
    //
    const dataToken = await this.signUserData(
      ISSUER_PRIVKEY,
      dataObj,
      issuerPubkey
    );

    return dataToken;
  }
}
