
import path from 'node:path';
import util from 'node:util';
import got from 'got';
import * as OADR3 from 'openadr-3-ts-types';
import { OADR3Client } from '../client.js';
import { tryParseBody, validateBody, validateBodyArray, validateParams } from './common.js';

export async function searchVens(client: OADR3Client, params: OADR3.SearchVensQueryParams)
    : Promise<Array<OADR3.Ven> | undefined>
{
    const searchVens = validateParams<OADR3.SearchVensQueryParams>(OADR3.joiValidateSearchVens, params);
    const { endpoint, headers } = await client.clientParams('vens');

    const options = {
        headers,
        searchParams: searchVens
    };

    let vensBody;
    try {
        const _progs = await got.get(endpoint.href, options as any);
        vensBody = _progs?.body;
    } catch (err: any) {
        throw new Error(`searchAllEvents FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }
    
    let events = tryParseBody<any[]>(vensBody);
    return validateBodyArray<OADR3.Ven>(OADR3.joiValidateVen, events);
}

export async function createVen(client: OADR3Client, ven: OADR3.Ven)
    : Promise<OADR3.Ven | undefined>
{
    const _ven = validateParams<OADR3.Ven>(OADR3.joiValidateVen, ven);
    const { endpoint, headers } = await client.clientParams('vens');

    let venBody;
    try {
        const ret = await got.post(endpoint.href, {
            json: _ven,
            headers
        });
        venBody = ret?.body;
    } catch (err: any) {
        throw new Error(`createVen FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(venBody);
    return validateBody<OADR3.Ven>(OADR3.joiValidateVen, parsed);
}

export async function searchVenByID(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Ven | undefined>
{
    const venID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    const { endpoint, headers } = await client.clientParams(path.join('vens', venID));

    let venBody;
    try {
        const ret = await got.get(endpoint.href, {
            headers
        });
        venBody = ret?.body;
    } catch (err: any) {
        throw new Error(`searchVenByID FAIL GET ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(venBody);
    return validateBody<OADR3.Ven>(OADR3.joiValidateVen, parsed);
}

export async function updateVen(client: OADR3Client, ven: OADR3.Ven)
    : Promise<OADR3.Ven | undefined>
{

    const _ven = validateParams<OADR3.Ven>(OADR3.joiValidateVen, ven);
    if (typeof _ven.id === 'undefined') {
        throw new Error(`updateVen Ven object to be updated must have ID`);
    }
    const { endpoint, headers } = await client.clientParams(path.join('vens', _ven.id));

    let venBody;
    try {
        const ret = await got.put(endpoint.href, {
            json: _ven,
            headers
        });
        venBody = ret?.body;
    } catch (err: any) {
        throw new Error(`updateVen FAIL PUT ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(venBody);
    return validateBody<OADR3.Ven>(OADR3.joiValidateVen, parsed);
}

export async function deleteVen(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Ven | undefined>
{
    const venID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    const { endpoint, headers } = await client.clientParams(path.join('vens', venID));
   
    let venBody;
    try {
        const ret = await got.delete(endpoint.href, {
            headers
        });
        venBody = ret?.body;
    } catch (err: any) {
        throw new Error(`deleteVen FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(venBody);
    return validateBody<OADR3.Ven>(OADR3.joiValidateVen, parsed);
}
