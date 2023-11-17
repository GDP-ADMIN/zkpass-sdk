import { injectable, inject } from 'inversify';
import { v4 } from "uuid";
import { StatusCodes } from 'http-status-codes';
import { DVRDTO, DataVerificationRequest, GenerateQrCodeDTO, KeysetEndpointWrapped, QRTypes, SIWEDTO, KeysetEndpoint, ZkpassQuery } from '@didpass/verifier-sdk';
import { SignedDvrResponse } from '@didpass/verifier-sdk/lib/types/signedDvrResponse';
import { ZkPassClient } from '@didpass/zkpass-client-ts'; 

import { nowInUnix } from '../helper';
import { VerifierInstance } from './sdk/VerifierInstance';
import VerifierRepository from './VerifierRepository';
import { AuthVerificationResult } from '../types/VerifierResultTypes';
import { VerifyCase, retrieveCaseType, retrieveDvrTitle, verifyCaseMap } from '../cases/useCase';
import { QueryBuilderService } from './QueryBuilderService';
import { CheckStatusResponse } from '@backend/types/ResponseTypes';
import { DvrQueryCacheResponse, VerificationStatus, ZkPassQueryCriteria } from '@backend/types/VerifierTypes';
import { CreateSignedDvrParams, GenerateZkpassQueryParams, RequestVerifyParams } from '../types/VerifierParamTypes';

@injectable()
export class VerifierService {
  private verifier;
  private verifierRepository;
  private queryBuilder;
  private zkPassClient;

  public constructor(
    @inject("VerifierRepository") verifierRepository: VerifierRepository,
    @inject('QueryBuilderService') queryBuilder: QueryBuilderService,
    @inject("VerifierInstance") verifierInstance: VerifierInstance
  ) {
    this.verifier = verifierInstance.getInstance();
    this.verifierRepository = verifierRepository;
    this.queryBuilder = queryBuilder;
    this.zkPassClient = new ZkPassClient();
  }

  /**
   * Check status of request
   * 
   * @param sessionId 
   * 
   * @returns {Promise<void>}
   */
  async checkStatus(
    sessionId: string
  ): Promise<CheckStatusResponse> {
    // fetch authrequest from cache
    const cachedAuthRequest =
      this.verifierRepository.getVerificationRequestFromCache(sessionId);

    // if found return status pending
    if (cachedAuthRequest) {
      return {
        status: StatusCodes.OK,
        statusType: VerificationStatus.PENDING,
        message: `Verification request with Session ID ${sessionId} is pending`,
      };
    }

    // fetch authrequest from db
    const proofVerificationOutput =
      this.verifierRepository.getZkpassProofVerificationOutput(sessionId);

    // if found return status verified
    if (proofVerificationOutput) {
      return {
        status: StatusCodes.OK,
        statusType: VerificationStatus.VERIFIED,
        message: `Verification request with Session ID ${sessionId} already verified`,
      };
    }

    // if not found in both redis & db, return not found
    return {
      status: StatusCodes.NOT_FOUND,
      statusType: VerificationStatus.NOT_FOUND,
      message: `Verification request with Session ID ${sessionId} cannot be found`,
    };
  };

  /**
   * Request verification
   * 
   * @param params 
   * 
   * @returns {Promise<AuthVerificationResult>}
   */
  async requestVerification(
    params: RequestVerifyParams
  ): Promise<AuthVerificationResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const { dvrId, dvrTitle, queryId } = params;
        
        // Prepare QR code data
        const hostUrl = process.env.NEXT_PUBLIC_URL;
        const sessionId = v4();
        const callbackPath = "/api/callback/signed-dvr";
        const callbackUrl = `${hostUrl}${callbackPath}?sessionId=${sessionId}`;
        const options: GenerateQrCodeDTO = {
          callbackUrl,
          dvr: {
            dvrId: dvrId,
            dvrTitle: dvrTitle,
          },
        };

        // Generate QR Code
        const qrCode = this.verifier.generateQrCode(options);
        const authRequest: AuthVerificationResult = {
          id: sessionId,
          qrCode: qrCode,
          requestedAt: nowInUnix(),
        };

        // Cache Query
        const dvrRequest = {
          dvrId,
          dvrTitle,
          queryId,
        };

        this.verifierRepository.cacheValue(
          `${sessionId}_query`,
          dvrRequest
        ); // Cache corresponding sessionID for a query
        this.verifierRepository.cacheVerificationRequest(
          authRequest
        ); // Cache QR data

        resolve(authRequest);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Create a signed DVR token using verifier SDK
   * 
   * @param params 
   * 
   * @returns {{Promise<SignedDvrResponse>}} 
   */
  public async createSignedDvr(
    params: CreateSignedDvrParams
  ): Promise<SignedDvrResponse> {
    return new Promise(async (resolve, reject) => {
      try {
        const privateKey = process.env.VERIFIER_PRIVATE_KEY_PEM;
        const jkuIssuer = process.env.KEYSET_ENDPOINT_JKU_ISSUER;
        const kidIssuer = process.env.KEYSET_ENDPOINT_KID_ISSUER || "k-1";
        const jkuVerifier = process.env.KEYSET_ENDPOINT_JKU_VERIFIER;
        const kidVerifier = process.env.KEYSET_ENDPOINT_KID_VERIFIER || "k-1";
        const verifierDid = process.env.VERIFIER_IDENTIFIER || "";
        const {
          dvrId,
          dvrTitle,
          fullQuery: query,
          sessionId,
          siweDto,
        } = params;

        if (!privateKey || !jkuIssuer || !jkuVerifier || !verifierDid) {
          throw "Missing value of private key or jku!";
        }
        
        const user_data_verifying_key: KeysetEndpointWrapped = {
          KeysetEndpoint: {
            jku: jkuIssuer,
            kid: kidIssuer,
          },
        };
        const verifyingKeyJKWS: KeysetEndpoint = {
          jku: jkuVerifier,
          kid: kidVerifier,
        };

        const { queryEngineVersion, queryMethodVersion } = await this.zkPassClient.getQueryEngineVersionInfo();

        const user_data_url = "https://example.com/user_data";
        const dvr = new DataVerificationRequest(
          dvrTitle,
          dvrId,
          queryEngineVersion,
          queryMethodVersion,
          query,
          user_data_url,
          user_data_verifying_key
        );
          
        // Sign DVR token using Verifier SDK
        const dvrDto: DVRDTO = {
          keyInPem: privateKey,
          dvr,
          verifyingKeyJKWS,
        };

        const hostUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
        const callbackPath = "/api/callback/verify-proof";
        const callbackUrl = `${hostUrl}${callbackPath}?sessionId=${sessionId}`;
        
        const signedDVRToken = await this.verifier.signDvrToken(
          dvrDto,
          siweDto,
          callbackUrl,
          verifierDid
        );

        this.verifierRepository.cacheSignedDvr(signedDVRToken); // Cache the dvrId (id) corresponding with the query
        
        return resolve(signedDVRToken);
      } catch (err) {
        reject("Query is not correct");
      }
    });
  };

  /**
   * Construct full query 
   * 
   * @param queryId 
   * 
   * @returns {Promise<ZkpassQuery} 
   */
  public async constructFullQuery(
    queryId: string
  ): Promise<ZkpassQuery>{
    return new Promise((resolve, reject) => {
      try{
        const fullCaseQuery = verifyCaseMap[parseInt(queryId) as VerifyCase];

        // Construct query
        const criterias: ZkPassQueryCriteria[] = fullCaseQuery.map((useCase) => {
          return {
            credField: useCase.field,
            verifyOperator: useCase.operator,
            value: useCase.value,
          };
        });       
        const caseType = retrieveCaseType(parseInt(queryId));
        if(!caseType){
          reject('Query is not correct')
          return;
        }

        const generateQueryParams: GenerateZkpassQueryParams = {
          schemaType: caseType,
          criterias,
        };

        const fullQuery = this.queryBuilder.buildFullQuery(generateQueryParams);

        resolve(fullQuery);
      }catch(err){
        reject(err);
      };
    })
  };

  /**
   * Retrieve DVR title and title based on queryId
   * 
   * @param queryId 
   * 
   * @returns {Promise<{dvrId: string, dvrTitle: string, queryId: string}>} 
   */
  public getDvrIdTitle(queryId: string): Promise<{
    dvrId: string; 
    dvrTitle: string;
    queryId: string;
  }> {
    return new Promise((resolve, reject) => {
      const dvrId = v4();
      const dvrTitle = retrieveDvrTitle(queryId);
      
      if(!dvrTitle.length) {
        reject('Use case not found!');
      }
      
      resolve({
        dvrId,
        dvrTitle,
        queryId,
      });
    });
  }

  /**
   * Retrieve DVR request from cache
   * 
   * @param sessionId 
   * 
   * @returns {Promise<DvrQueryCacheResponse | null>}
   */
  async getDvrFromCache(
    sessionId: string
  ): Promise<DvrQueryCacheResponse | null> {
    const cachedSessionData = await this.verifierRepository.getCacheValue(
      `${sessionId}_query`
    );
    return cachedSessionData;
  }

  /**
   * Verify SIWE signature
   * 
   * @param siweDTO 
   * 
   * @returns {Promise<void>}
   */
  async verifySiwe(siweDTO: SIWEDTO): Promise<void> {
    try {
      this.verifier.verifySiwe(siweDTO);
    } catch (err) {
      throw err;
    }
  }
};