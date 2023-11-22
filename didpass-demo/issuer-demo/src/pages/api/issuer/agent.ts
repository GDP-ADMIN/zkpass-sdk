import { IssuerService } from "@/backend/IssuerService";
import { ICredentialQRPayload, IWalletResponse } from "@/backend/dto";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method !== "POST") {
    return res.status(StatusCodes.BAD_REQUEST).send(ReasonPhrases.BAD_REQUEST);
  }
  let response: IWalletResponse<{ result: string }>;

  try {
    const credentialPayload: ICredentialQRPayload = req.body;
    const issuerService = new IssuerService();
    const result = await issuerService.getClaimCredential(credentialPayload);

    response = {
      status: StatusCodes.OK,
      statusText: ReasonPhrases.OK,
      data: result,
    };
  } catch (error) {
    console.log(error);
    response = {
      status: StatusCodes.BAD_REQUEST,
      statusText: ReasonPhrases.BAD_REQUEST,
    };
  }

  return res.status(response.status).send(response);
}