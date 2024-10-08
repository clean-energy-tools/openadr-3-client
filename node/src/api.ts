
import path from 'node:path';
export * from './client.js';
export * from './components/events.js';
export * from './components/programs.js';
export * from './components/reports.js';
export * from './components/resources.js';
export * from './components/subscriptions.js';
export * from './components/vens.js';


// if (typeof process.env.OADR3_BASE_URL !== 'string') {
//     throw new Error(`Must supply OADR3_BASE_URL environment variable`);
// }

// The package requires one or two environment variables for
// configuring the connection URL to the OpenADR3 server.
// The design is based on the URL object.
//
// The result is to be a variable, OADR3_URL, which is
// defined in one of two ways:
//
//    If only the OADR3_URL environment variable is set:
//        const OADR3_URL = new URL(process.env.OADR3_URL)
//
//    If OADR3_BASE_URL is also set
//        const OADR3_URL = new URL(
//                  process.env.OADR3_URL,
//                  process.env.OADR3_BASE_URL)
//
// This is chosen to be similar to the URL object constructor
// which is either
//       new URL('url string')
//   or: new URL('url string', 'http://base-url.domain')

// if (typeof process.env.OADR3_URL !== 'string') {
//     throw new Error(`Must supply OADR3_URL environment variable`);
// }

// export const OADR3_URL =
//     typeof process.env.OADR3_BASE_URL !== 'undefined'
//         ? new URL(process.env.OADR3_URL, process.env.OADR3_BASE_URL)
//         : new URL(process.env.OADR3_URL);

// /**
//  * Compute a URL object for an endpoint.  The base URL is derived
//  * from the OADR3_URL object, and the string "endpoint" is tacked on.
//  * @param endpoint 
//  * @returns URL object
//  */
// export function oadr3EndpointURL(endpoint: string): URL {
//     const ret = new URL(OADR3_URL.href);
//     ret.pathname = path.join(ret.pathname, endpoint);
//     return ret;
// }