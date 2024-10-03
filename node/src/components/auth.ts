
// import path from 'node:path';
// import util from 'node:util';
// import got from 'got';
// import * as OADR3 from 'openadr-3-ts-types';
// import { oadr3EndpointURL } from '../api.js';



// // NOTE -- This must be rewritten to support multiple clients

// // Hence, api.ts should define a Class
// //    -- Instantiating the class, it records client_id/secret/scope
// //    -- It should have a method to fetch authToken, remember the
// //       token as shown here, to delete the token over time, etc
// //    -- Other methods of the class are the OADR3 functions
// //
// // Otherwise - instead, the OADR3 functions must take
// // a client object as the first parameter.

// if (typeof process.env.OADR3_CLIENT_ID !== 'string') {
//     throw new Error(`Must supply OADR3_CLIENT_ID environment variable`);
// }

// if (typeof process.env.OADR3_CLIENT_SECRET !== 'string') {
//     throw new Error(`Must supply OADR3_CLIENT_SECRET environment variable`);
// }

// if (typeof process.env.OADR3_CLIENT_SCOPE !== 'string') {
//     throw new Error(`Must supply OADR3_CLIENT_SCOPE environment variable`);
// }

// const oath2_client_id     = process.env.OADR3_CLIENT_ID;
// const oath2_client_secret = process.env.OADR3_CLIENT_SECRET;
// const oath2_client_scope  = process.env.OADR3_CLIENT_SCOPE;


// // authHeaders must return the headers
// // It must first check the existing token
// // to see if 
// //    a) it exists
// //    b) it is still valid (not expired)
// //
// // If those conditions are true, then return
// // the headers immediately.
// //
// // If either is false, then first use fetchToken
// // to retrieve a token from the server.
// //
// // In fetchToken, if the retrieval goes correctly,
// // then save the token to a global.  Otherwise
// // throw an error.

// // What about SKIP_OAUTH?


// export async function authHeaders() {
//     let token;
//     if (typeof _authToken === 'undefined') {
//         token = await fetchToken();
//     } else {
//         token = _authToken;
//     }
//     const headers = token
//         ? {
//             Authorization: `Bearer ${token.access_token}`
//         } : undefined;
    
//     return headers;
// }


// /**
//  * Invoke the /auth/token endpoint to retrieve
//  * an OAuth2 token.
//  */
// export async function fetchToken(): Promise<OADR3.ClientCredentialResponse> {
//     const request: OADR3.ClientCredentialRequest = {
//         grant_type: "client_credentials",
//         client_id: oath2_client_id,
//         client_secret: oath2_client_secret,
//         scope: oath2_client_scope
//     };

//     const endpoint = oadr3EndpointURL(path.join('auth', 'token'));

//     let res;
//     try {
//         res = await got.post(
//             endpoint.href,
//             {
//                 // Got autoconverts this to use
//                 //
//                 // Content-Type
//                 // application/x-www-form-urlencoded
//                 //
//                 // And to use URLSearchParams to
//                 // encode the form field
//                 // which is exactly what's required
//                 form: request
//             }
//         );

//         if (res.statusCode !== 200) {
//             throw new Error(`fetchToken ERROR ${res.statusCode} ${res.statusMessage} ${res.url} ${res.method} ${util.inspect(res.headers)} ${JSON.parse(res.body).title}`);
//         } else {
//             const _ccresponse = JSON.parse(res.body);
//             const { error, value } = OADR3.joiClientCredentialResponse.validate(_ccresponse);
//             if (error) {
//                 throw new Error(`fetchToken FAIL response body not Client Credential Response - ${error.details}`);
//             }

//             const ccresponse = value as OADR3.ClientCredentialResponse;
//             rememberOAuth2Token(ccresponse);
//             return ccresponse;
//         }

//     } catch (err: any) {
//         throw new Error(`fetchToken FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
//     }
// }

// let _authToken: OADR3.ClientCredentialResponse | undefined;
// let _authTokenTimeout: any;

// function rememberOAuth2Token(ccresponse: OADR3.ClientCredentialResponse) {
//     if (typeof _authTokenTimeout !== 'undefined') {
//         clearTimeout(_authTokenTimeout);
//         _authTokenTimeout = undefined;
//     }
//     _authToken = ccresponse;
//     if (typeof ccresponse.expires_in === 'number') {
//         _authTokenTimeout = setTimeout(() => {
//             _authToken = undefined;
//         }, ccresponse.expires_in - 15);
//     }
// }
