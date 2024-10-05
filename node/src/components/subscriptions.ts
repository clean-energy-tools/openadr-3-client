
import path from 'node:path';
import util from 'node:util';
import got from 'got';
import * as OADR3 from 'openadr-3-ts-types';
import { OADR3Client } from '../client.js';
import { tryParseBody, validateBody, validateBodyArray, validateParams } from './common.js';

export async function searchSubscriptions(client: OADR3Client, params: OADR3.SearchSubscriptionsQueryParams)
    : Promise<Array<OADR3.Subscription> | undefined>
{
    const searchSubscriptions = validateParams<OADR3.SearchSubscriptionsQueryParams>(OADR3.joiValidateSearchSubscriptions, params);
    const { endpoint, headers } = await client.clientParams('subscriptions');

    const options = {
        headers,
        searchParams: searchSubscriptions
    };

    let subscriptionsBody;
    try {
        const _progs = await got.get(endpoint.href, options as any);
        subscriptionsBody = _progs?.body;
    } catch (err: any) {
        throw new Error(`searchSubscriptions FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }
    
    let subscriptions = tryParseBody<any[]>(subscriptionsBody);
    return validateBodyArray<OADR3.Subscription>(OADR3.joiValidateSubscription, subscriptions);
}

export async function createSubscription(client: OADR3Client, event: OADR3.Subscription)
    : Promise<OADR3.Subscription | undefined>
{
    const _subscription = validateParams<OADR3.Subscription>(OADR3.joiValidateSubscription, event);
    const { endpoint, headers } = await client.clientParams('subscriptions');

    let subscriptionsBody;
    try {
        const ret = await got.post(endpoint.href, {
            json: _subscription,
            headers
        });
        subscriptionsBody = ret?.body;
    } catch (err: any) {
        throw new Error(`createSubscription FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(subscriptionsBody);
    return validateBody<OADR3.Subscription>(OADR3.joiValidateSubscription, parsed);
}

export async function searchSubscriptionByID(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Subscription | undefined>
{
    const subID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    const { endpoint, headers } = await client.clientParams(path.join('subscriptions', subID));

    let subscriptionsBody;
    try {
        const ret = await got.get(endpoint.href, {
            headers
        });
        subscriptionsBody = ret?.body;
    } catch (err: any) {
        throw new Error(`searchSubscriptionByID FAIL GET ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(subscriptionsBody);
    return validateBody<OADR3.Subscription>(OADR3.joiValidateSubscription, parsed);
}

export async function updateSubscription(client: OADR3Client, event: OADR3.Subscription)
    : Promise<OADR3.Subscription | undefined>
{
    const _sub = validateParams<OADR3.Subscription>(OADR3.joiValidateSubscription, event);
    if (typeof _sub.id === 'undefined') {
        throw new Error(`updateSubscription Subscription object to be updated must have ID`);
    }
    const { endpoint, headers } = await client.clientParams(path.join('subscriptions', _sub.id));

    let subscriptionsBody;
    try {
        const ret = await got.put(endpoint.href, {
            json: _sub,
            headers
        });
        subscriptionsBody = ret?.body;
    } catch (err: any) {
        throw new Error(`updateSubscription FAIL PUT ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(subscriptionsBody);
    return validateBody<OADR3.Subscription>(OADR3.joiValidateSubscription, parsed);
}

export async function deleteSubscription(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Subscription | undefined>
{
    const subID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    const { endpoint, headers } = await client.clientParams(path.join('subscriptions', subID));
   
    let subscriptionsBody;
    try {
        const ret = await got.delete(endpoint.href, {
            headers
        });
        subscriptionsBody = ret?.body;
    } catch (err: any) {
        throw new Error(`deleteSubscription FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(subscriptionsBody);
    return validateBody<OADR3.Subscription>(OADR3.joiValidateSubscription, parsed);
}
