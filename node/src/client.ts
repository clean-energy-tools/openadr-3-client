
import util from 'node:util';
import path from 'node:path';
import * as OADR3 from 'openadr-3-ts-types';
import got from 'got';

import * as events from './components/events.js';
import * as programs from './components/programs.js';
import * as reports from './components/reports.js';
import * as resources from './components/resources.js';
import * as subscriptions from './components/subscriptions.js';
import * as vens from './components/vens.js';

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

        // console.log({
        //     oadr3URL: oadr3URL,
        //     oadr3URLTHIS: this.#oadr3URL,
        //     name: name,
        //     nameTHIS: this.#name,
        //     client_id: client_id,
        //     client_idTHIS: this.#client_id,
        //     client_secret: client_secret,
        //     client_secretTHIS: this.#client_secret,
        //     scope: scope,
        //     scopeTHIS: this.#scope
        // });
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
            headers: await this.authHeaders()
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

    clientInfo() {
        return {
            client_id: this.#client_id,
            client_secret: this.#client_secret,
            scope: this.#scope,
            auth: this.#authToken
        }
    }
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
        
        let { error, value } = OADR3.joiValidateClientCredentialRequest({
            grant_type: "client_credentials",
            client_id: this.#client_id,
            client_secret: this.#client_secret,
            scope: this.#scope
        });

        const request: OADR3.ClientCredentialRequest = value;
        const endpoint = this.endpointURL(path.join('auth', 'token'));

        // console.log(`fetchToken ${endpoint.href} GET w/ ${util.inspect(request)}`);

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
            throw new Error(`fetchToken ERROR ${res?.statusCode} ${res?.statusMessage} ${res?.url} ${res?.method} ${util.inspect(res?.headers)} ${err?.message} ${util.inspect(res?.body)}`);
        }

        if (res.statusCode !== 200) {
            throw new Error(`fetchToken ERROR ${res?.statusCode} ${res?.statusMessage} ${res?.url} ${res?.method} ${util.inspect(res?.headers)} ${util.inspect(res?.body)}`);
        }

        const _ccresponse = JSON.parse(res.body);
        // console.log(`${res?.body} ==> ${util.inspect(_ccresponse)}`);
        const result = OADR3.joiClientCredentialResponse.validate(_ccresponse);
        error = result.error;
        value = result.value;
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


    // The following methods all implement the operations
    // in the OpenADR specification.  The actual implementation
    // is in the corresponding module in ./components.

    ///////////// Auth

    // The fetchToken operation is implemented above.

    ///////////// Events

    async searchAllEvents(
        params: OADR3.SearchAllEventsQueryParams
    ) : Promise<Array<OADR3.Event> | undefined> {
        return events.searchAllEvents(this, params);
    }

    async createEvent(
        event: OADR3.Event
    ) : Promise<OADR3.Event | undefined> {
        return events.createEvent(this, event);
    }

    async searchEventsByID(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Event | undefined> {
        return events.searchEventsByID(this, id);
    }

    async updateEvent(
        event: OADR3.Event
    ) : Promise<OADR3.Event | undefined> {
        return events.updateEvent(this, event);
    }

    async deleteEvent(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Event | undefined> {
        return events.deleteEvent(this, id);
    }

    ///////////// Programs

    async searchAllPrograms(
        params: OADR3.SearchAllProgramsQueryParams
    ) : Promise<Array<OADR3.Program> | undefined> {
        return programs.searchAllPrograms(this, params);
    }

    async createProgram(
        program: OADR3.Program
    ) : Promise<OADR3.Program | undefined> {
        return programs.createProgram(this, program);
    }

    async searchProgramByProgramId(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Program | undefined> {
        return programs.searchProgramByProgramId(this, id);
    }

    async updateProgram(
        program: OADR3.Program
    ) : Promise<OADR3.Program | undefined> {
        return programs.updateProgram(this, program);
    }

    async deleteProgram(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Program | undefined> {
        return programs.deleteProgram(this, id);
    }

    ///////////// Reports

    async searchAllReports(
        params: OADR3.SearchAllReportsQueryParams
    ) : Promise<Array<OADR3.Report> | undefined> {
        return reports.searchAllReports(this, params);
    }

    async createReport(
        report: OADR3.Report
    ) : Promise<OADR3.Report | undefined> {
        return reports.createReport(this, report);
    }

    async searchReportsByReportID(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Report | undefined> {
        return reports.searchReportsByReportID(this, id);
    }

    async updateReport(
        report: OADR3.Report
    ) : Promise<OADR3.Report | undefined> {
        return reports.updateReport(this, report);
    }

    async deleteReport(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Report | undefined> {
        return reports.deleteReport(this, id);
    }

    ///////////// Resources

    async searchVenResources(
        id: OADR3.ObjectID,
        params: OADR3.SearchVenResourcesQueryParams
    ) : Promise<Array<OADR3.Resource> | undefined> {
        return resources.searchVenResources(this, id, params);
    }

    async createResource(
        id: OADR3.ObjectID,
        resource: OADR3.Resource
    ) : Promise<OADR3.Resource | undefined> {
        return resources.createResource(this, id, resource);
    }

    async searchVenResourceByID(
        vid: OADR3.ObjectID,
        rid: OADR3.ObjectID,
    ) : Promise<OADR3.Resource | undefined> {
        return resources.searchVenResourceByID(this, vid, rid);
    }

    async updateVenResource(
        vid: OADR3.ObjectID,
        resource: OADR3.Resource
    ) : Promise<OADR3.Resource | undefined> {
        return resources.updateVenResource(this, vid, resource);
    }

    async deleteVenResource(
        vid: OADR3.ObjectID, 
        rid: OADR3.ObjectID
    ) : Promise<OADR3.Resource | undefined> {
        return resources.deleteVenResource(this, vid, rid);
    }

    ///////////// Subscriptions

    async searchSubscriptions(
        params: OADR3.SearchSubscriptionsQueryParams
    ) : Promise<Array<OADR3.Subscription> | undefined> {
        return subscriptions.searchSubscriptions(this, params);
    }

    async createSubscription(
        subscription: OADR3.Subscription
    ) : Promise<OADR3.Subscription | undefined> {
        return subscriptions.createSubscription(this, subscription);
    }

    async searchSubscriptionByID(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Subscription | undefined> {
        return subscriptions.searchSubscriptionByID(this, id);
    }

    async updateSubscription(
        subscription: OADR3.Subscription
    ) : Promise<OADR3.Subscription | undefined> {
        return subscriptions.updateSubscription(this, subscription);
    }

    async deleteSubscription(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Subscription | undefined> {
        return subscriptions.deleteSubscription(this, id);
    }

    ///////////// Vens

    async searchVens(
        params: OADR3.SearchVensQueryParams
    ) : Promise<Array<OADR3.Ven> | undefined> {
        return vens.searchVens(this, params);
    }

    async createVen(
        ven: OADR3.Ven
    ) : Promise<OADR3.Ven | undefined> {
        return vens.createVen(this, ven);
    }

    async searchVenByID(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Ven | undefined> {
        return vens.searchVenByID(this, id);
    }

    async updateVen(
        ven: OADR3.Ven
    ) : Promise<OADR3.Ven | undefined> {
        return vens.updateVen(this, ven);
    }

    async deleteVen(
        id: OADR3.ObjectID
    ) : Promise<OADR3.Ven | undefined> {
        return vens.deleteVen(this, id);
    }

}
