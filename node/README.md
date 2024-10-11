# Node.js/TypeScript package for OpenADR 3 clients

This project is a package implementing the OpenADR 3.x REST methods.  It allows an OpenADR 3.x client (known as VENs, or Virtual End Nodes) to call REST methods on OpenADR 3.x servers (known as VTNs, or Virtual Top Nodes).

Every method validates data supplied as method parameters, and validates data received from the VTN.

TODO

* Define an Error object that includes the HTTP result code

## INSTALLATION

```shell
$ npm install @clean-energy-tools/openadr-3-client --save
```

## USAGE

In TypeScript:

```js
import * as OADR3 from 'openadr-3-ts-types';
import { OADR3Client } from '@clean-energy-tools/openadr-3-client';

const ven_client_id = process.env?.OAUTH_VEN_CLIENT_ID;
const ven_client_secret = process.env?.OAUTH_VEN_CLIENT_SECRET;
const ven_scope = process.env?.OAUTH_VEN_SCOPE;

const venClient = new OADR3Client(OADR3URL, "ven", ven_client_id, ven_client_secret, ven_scope);
const token = await venClient.fetchToken();

const found = await allClient.searchAllEvents({
    eventName: 'TEST EVENT'
});
```

One must configure the client with its `client_id` and `client_secret` tokens, and its `scope` string.  These values will be provided using an administrative process with the VTN.  The first two are authentication tokens, and `scope` describes what kinds of OpenADR methods the client is allowed to access.

Then, when the client needs to make requests to the server, it first calls `fetchToken` which invokes the `/auth/token` endpoint.  Normally a client will not call this method as the other methods will automatically do so, as required.  If successful the authentication token is stored in the client.  A timer is used to forget the token shortly before its expiration.  The result is that the authentication token is cached inside the OADR3Client object, and is automatically refreshed as needed.

The OADR3Client object has methods matching matching the OpenADR 3 REST functions.  These methods take the same parameters, and return the same result objects.

## OpenADR 3 client methods

```js
new OADR3Client(oadr3URL: URL, name: string, client_id: string, client_secret: string, scope?: string)
```

Handles instantiating a new instance.

* `oadr3URL` gives the base URL for the VTN
* `name` is a string giving a user-defined name for the client
* `client_id` and `client_secret` are OAuth2 access tokens
* `scope` is the OAuth2 scope string

what follows are methods on the client object.

```js
endpointURL(endpoint: string): URL;
```

Computes the URL for a given API endpoint.  It is meant to be used this manner: `endpointURL(path.join('vens', venID))`, which gives us a URL operations on a given VEN.

```js
authHeaders()
```

Returns an object containing the _Authorization_ header containing the OAuth2 bearer authorization token.  If needed, the `fetchToken` method is invoked to fetch a token.

```js
///////////// Events

async searchAllEvents(
    params: OADR3.SearchAllEventsQueryParams
) : Promise<Array<OADR3.Event> | undefined>

async createEvent(
    event: OADR3.Event
) : Promise<OADR3.Event | undefined>

async searchEventsByID(
    id: OADR3.ObjectID
) : Promise<OADR3.Event | undefined>

async updateEvent(
    event: OADR3.Event
) : Promise<OADR3.Event | undefined>

async deleteEvent(
    id: OADR3.ObjectID
) : Promise<OADR3.Event | undefined>

///////////// Programs

async searchAllPrograms(
    params: OADR3.SearchAllProgramsQueryParams
) : Promise<Array<OADR3.Program> | undefined>

async createProgram(
    program: OADR3.Program
) : Promise<OADR3.Program | undefined>

async searchProgramByProgramId(
    id: OADR3.ObjectID
) : Promise<OADR3.Program | undefined>

async updateProgram(
    program: OADR3.Program
) : Promise<OADR3.Program | undefined>

async deleteProgram(
    id: OADR3.ObjectID
) : Promise<OADR3.Program | undefined>

///////////// Reports

async searchAllReports(
    params: OADR3.SearchAllReportsQueryParams
) : Promise<Array<OADR3.Report> | undefined>

async createReport(
    report: OADR3.Report
) : Promise<OADR3.Report | undefined>

async searchReportsByReportID(
    id: OADR3.ObjectID
) : Promise<OADR3.Report | undefined>

async updateReport(
    report: OADR3.Report
) : Promise<OADR3.Report | undefined>

async deleteReport(
    id: OADR3.ObjectID
) : Promise<OADR3.Report | undefined>

///////////// Resources

async searchVenResources(
    id: OADR3.ObjectID,
    params: OADR3.SearchVenResourcesQueryParams
) : Promise<Array<OADR3.Resource> | undefined>

async createResource(
    id: OADR3.ObjectID,
    resource: OADR3.Resource
) : Promise<OADR3.Resource | undefined>

async searchVenResourceByID(
    vid: OADR3.ObjectID,
    rid: OADR3.ObjectID,
) : Promise<OADR3.Resource | undefined>

async updateVenResource(
    vid: OADR3.ObjectID,
    resource: OADR3.Resource
) : Promise<OADR3.Resource | undefined>

async deleteVenResource(
    vid: OADR3.ObjectID, 
    rid: OADR3.ObjectID
) : Promise<OADR3.Resource | undefined>

///////////// Subscriptions

async searchSubscriptions(
    params: OADR3.SearchSubscriptionsQueryParams
) : Promise<Array<OADR3.Subscription> | undefined>

async createSubscription(
    subscription: OADR3.Subscription
) : Promise<OADR3.Subscription | undefined>

async searchSubscriptionByID(
    id: OADR3.ObjectID
) : Promise<OADR3.Subscription | undefined>

async updateSubscription(
    subscription: OADR3.Subscription
) : Promise<OADR3.Subscription | undefined>

async deleteSubscription(
    id: OADR3.ObjectID
) : Promise<OADR3.Subscription | undefined>

///////////// Vens

async searchVens(
    params: OADR3.SearchVensQueryParams
) : Promise<Array<OADR3.Ven> | undefined>

async createVen(
    ven: OADR3.Ven
) : Promise<OADR3.Ven | undefined>

async searchVenByID(
    id: OADR3.ObjectID
) : Promise<OADR3.Ven | undefined>

async updateVen(
    ven: OADR3.Ven
) : Promise<OADR3.Ven | undefined>

async deleteVen(
    id: OADR3.ObjectID
) : Promise<OADR3.Ven | undefined>
```

These implement the REST methods.

