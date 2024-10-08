

import * as OADR3 from 'openadr-3-ts-types';
import * as OADR3Client from '../dist/api.js';
import assert from 'node:assert';
import { describe, it } from 'node:test';

if (typeof process.env.OADR3URL !== 'string') {
    throw new Error(`Environment variable OADR3URL must contain the VTN URL`);
}

export const OADR3URL = new URL(process.env.OADR3URL);

export const ven_client_id = process.env?.OAUTH_VEN_CLIENT_ID;
export const ven_client_secret = process.env?.OAUTH_VEN_CLIENT_SECRET;
export const ven_scope = process.env?.OAUTH_VEN_SCOPE;

export const all_client_id = process.env?.OAUTH_ALL_CLIENT_ID;
export const all_client_secret = process.env?.OAUTH_ALL_CLIENT_SECRET;
export const all_scope = process.env?.OAUTH_ALL_SCOPE;

export var venClient;
export var allClient;

describe('Auth', async () => {

    it('should fail to generate auth token for bad client tokens', async () => {
        const client = new OADR3Client.OADR3Client(OADR3URL, 'badClient', 'bad_id', 'bad_secret', 'bad_scope');

        let sawErrors = false;
        let token;
        try {
            token = await client.fetchToken();
        } catch (err) {
            sawErrors = true;
        }
        // assert sawErrors === true
        if (token) {
            const { error, value } = OADR3.joiClientCredentialResponse.validate(token);
            // assert error && !value
        }
    });

    it('should generate "ven" client token', async () => {
        venClient = new OADR3Client.OADR3Client(OADR3URL, "ven", ven_client_id, ven_client_secret, ven_scope);
        const token = await venClient.fetchToken();
        // console.log(token);
    });

    it('should generate "ALLACCESS" client token', async () => {
        allClient = new OADR3Client.OADR3Client(OADR3URL, "ALLACCESS", all_client_id, all_client_secret, all_scope);
        const token = await allClient.fetchToken();
        // console.log(token);
    });

});
