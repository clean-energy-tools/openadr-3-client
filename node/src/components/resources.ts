
import path from 'node:path';
import util from 'node:util';
import got from 'got';
import * as OADR3 from 'openadr-3-ts-types';
import { OADR3Client } from '../client.js';
import { OADR3Error, tryParseBody, validateBody, validateBodyArray, validateParams } from './common.js';

export async function searchVenResources(
    client: OADR3Client,
    id: OADR3.ObjectID,
    params: OADR3.SearchVenResourcesQueryParams
)
    : Promise<Array<OADR3.Resource> | undefined>
{
    const venID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    const searchResources = validateParams<OADR3.SearchVenResourcesQueryParams>(OADR3.joiValidateSearchVenResources, params);
    const { endpoint, headers } = await client.clientParams(path.join('vens', venID, 'resources'));

    const options = {
        headers,
        searchParams: searchResources
    };

    let resourcesBody;
    try {
        const _progs = await got.get(endpoint.href, options as any);
        resourcesBody = _progs?.body;
    } catch (err: any) {
        const t = new OADR3Error(`searchVenResources FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }
    
    let events = tryParseBody<any[]>(resourcesBody);
    return validateBodyArray<OADR3.Resource>(OADR3.joiValidateResource, events);
}

export async function createResource(client: OADR3Client, id: OADR3.ObjectID, resource: OADR3.Resource)
    : Promise<OADR3.Resource | undefined>
{
    const venID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    const _resource = validateParams<OADR3.Resource>(OADR3.joiValidateResource, resource);
    const { endpoint, headers } = await client.clientParams(path.join('vens', venID, 'resources'));

    let resourceBody;
    try {
        const ret = await got.post(endpoint.href, {
            json: _resource,
            headers
        });
        resourceBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`createResource FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(resourceBody);
    return validateBody<OADR3.Resource>(OADR3.joiValidateResource, parsed);
}

export async function searchVenResourceByID(
    client: OADR3Client,
    vid: OADR3.ObjectID,
    rid: OADR3.ObjectID
)
    : Promise<OADR3.Resource | undefined>
{
    const venID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, vid);
    const resourceID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, rid);
    const { endpoint, headers } = await client.clientParams(path.join('vens', venID, 'resources', resourceID));

    let resourceBody;
    try {
        const ret = await got.get(endpoint.href, {
            headers
        });
        resourceBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`searchVenResourceByID FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(resourceBody);
    return validateBody<OADR3.Resource>(OADR3.joiValidateResource, parsed);
}

export async function updateVenResource(
    client: OADR3Client, 
    vid: OADR3.ObjectID, 
    resource: OADR3.Resource
)
    : Promise<OADR3.Resource | undefined>
{
    const venID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, vid);
    const _resource = validateParams<OADR3.Resource>(OADR3.joiValidateResource, resource);
    if (typeof _resource.id === 'undefined') {
        throw new Error(`updateVenResource Resource object to be updated must have ID`);
    }
    const { endpoint, headers } = await client.clientParams(path.join('vens', venID, 'resources', _resource.id));

    let resourceBody;
    try {
        const ret = await got.put(endpoint.href, {
            json: _resource,
            headers
        });
        resourceBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`updateVenResource FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(resourceBody);
    return validateBody<OADR3.Resource>(OADR3.joiValidateResource, parsed);
}

export async function deleteVenResource(
    client: OADR3Client, 
    vid: OADR3.ObjectID, 
    rid: OADR3.ObjectID
)
    : Promise<OADR3.Resource | undefined>
{
    const venID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, vid);
    const resourceID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, rid);
    const { endpoint, headers } = await client.clientParams(path.join('vens', venID, 'resources', resourceID));
   
    let resourceBody;
    try {
        const ret = await got.delete(endpoint.href, {
            headers
        });
        resourceBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`deleteVenResource FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(resourceBody);
    return validateBody<OADR3.Resource>(OADR3.joiValidateResource, parsed);
}
