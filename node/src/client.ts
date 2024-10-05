
import util from 'node:util';
import path from 'node:path';
import * as OADR3 from 'openadr-3-ts-types';
import got from 'got';

/**
 * A named client for OpenADR 3, connecting to a specific VTN, using
 * pre-provisioned client_id/secret/scope strings.  This client
 * generates an access token as needed.  It remembers the expirey
 * time for the token, deleting it shortly before that time expires,
 * allowing it to automatically generate a new token when required.
 * 
 * The "client" is defined by:
 *     * the URL for the VTN
 *     * the client name
 *     * the client_id, client_secret, and scope
 */
export class OADR3Client {

    #oadr3URL: URL;
    #name: string;
    #client_id: string;
    #client_secret: string;
    #scope?: string;

    /**
     * Construct a client object
     * 
     * @param oadr3URL 
     * @param name 
     * @param client_id 
     * @param client_secret 
     * @param scope 
     */
    constructor(oadr3URL: URL, name: string, client_id: string, client_secret: string, scope?: string) {

        if (typeof oadr3URL !== 'object') {
            throw new Error(`The oadr3URL parameter must be a URL`);
        }
        if (typeof name !== 'string') {
            throw new Error('The name parameter must be a string');
        }
        if (typeof client_id !== 'string') {
            throw new Error('The client_id parameter must be a string');
        }
        if (typeof client_secret !== 'string') {
            throw new Error('The client_secret parameter must be a string');
        }
        if (typeof scope !== 'undefined' && typeof scope !== 'string') {
            throw new Error('The scope parameter, if given, must be a string');
        }

        this.#oadr3URL = oadr3URL;
        this.#name = name;
        this.#client_id = client_id;
        this.#client_secret = client_secret;
        this.#scope = scope; 
    }

    /**
     * Fetch the URL for the VTN
     */
    get oadr3URL() { return this.#oadr3URL; }

    /**
     * Fetch the client name
     */
    get name() { return this.#name; }

    /**
     * Fetch the client_id
     */
    get client_id() { return this.#client_id; }

    /**
     * Fetch the client_secret
     */
    get client_secret() { return this.#client_secret; }

    /**
     * Fetch the scope
     */
    get scope() { return this.#scope; }

    /**
     * Return all data from the client required for configuring Got calls.
     * 
     * @param endpoint 
     * @returns 
     */
    async clientParams(endpoint: string)
        : Promise<{ endpoint: URL, headers: any }>
    {
        return {
            endpoint: this.endpointURL(endpoint),
            headers: this.authHeaders()
        };
    }

    /**
     * Compute the URL, starting from oadr3URL, for the
     * API endpoint given in the string.
     * @param endpoint 
     * @returns The corresponding URL object
     */
    endpointURL(endpoint: string): URL {
        const ret = new URL(this.#oadr3URL.href);
        const pname = ret.pathname;
        ret.pathname = path.join(pname, endpoint);
        return ret;
    }

    #authToken?: OADR3.ClientCredentialResponse;
    #authTokenTimeout?: any;

    /**
     * Generate a headers object for use with 'got'
     * for the Bearer authorization header.  It
     * uses fetchToken to automatically fetch the
     * access token.
     * 
     * @returns 
     */
    async authHeaders() {
        const headers = (await this.fetchToken()).access_token
            ? {
                Authorization: `Bearer ${(await this.fetchToken()).access_token}`
            } : undefined;

        return headers;
    }

    /**
     * Either returns an existing ClientCredentialResponse or fetches
     * one from the server.  The response object contains the access_token
     * plus other useful information.
     * 
     * @returns the ClientCredentialResponse access token for this client.
     */
    async fetchToken() {
        if (this.#authToken) {
            return this.#authToken;
        }

        const request: OADR3.ClientCredentialRequest = {
            grant_type: "client_credentials",
            client_id: this.#client_id,
            client_secret: this.#client_secret,
            scope: this.#scope
        };

        const endpoint = this.endpointURL(path.join('auth', 'token'));

        let res;
        try {
            res = await got.post(
                endpoint.href,
                {
                    // Got autoconverts this to use
                    //
                    // Content-Type
                    // application/x-www-form-urlencoded
                    //
                    // And to use URLSearchParams to
                    // encode the form field
                    // which is exactly what's required
                    form: request
                }
            );
        } catch(err: any) {
            throw new Error(`fetchToken ERROR ${res?.statusCode} ${res?.statusMessage} ${res?.url} ${res?.method} ${util.inspect(res?.headers)} ${util.inspect(res?.body)}`);
        }

        if (res.statusCode !== 200) {
            throw new Error(`fetchToken ERROR ${res?.statusCode} ${res?.statusMessage} ${res?.url} ${res?.method} ${util.inspect(res?.headers)} ${util.inspect(res?.body)}`);
        }

        const _ccresponse = JSON.parse(res.body);
        // console.log(`${res?.body} ==> ${util.inspect(_ccresponse)}`);
        const { error, value } = OADR3.joiClientCredentialResponse.validate(_ccresponse);
        if (error) {
            throw new Error(`fetchToken FAIL response body not Client Credential Response - ${util.inspect(error.details)}`);
        }

        const ccresponse = value as OADR3.ClientCredentialResponse;
        this.#rememberOAuth2Token(ccresponse);
        return ccresponse;
    }

    /**
     * Records the token, and takes care of forgetting the token
     * when the expirey time is finished.  By "token" we
     * mean the ClientCredentialResponse object.  It subtracts 15ms from
     * the expirey time to account for some slop.
     *
     * @param ccresponse 
     */
    #rememberOAuth2Token(ccresponse: OADR3.ClientCredentialResponse) {
        if (typeof this.#authTokenTimeout !== 'undefined') {
            clearTimeout(this.#authTokenTimeout);
            this.#authTokenTimeout = undefined;
        }
        this.#authToken = ccresponse;
        if (typeof ccresponse.expires_in === 'number') {
            this.#authTokenTimeout = setTimeout(() => {
                this.#authToken = undefined;
            }, ccresponse.expires_in - 15);
        }
    }
}