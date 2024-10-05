
import path from 'node:path';
import util from 'node:util';
import got from 'got';
import * as OADR3 from 'openadr-3-ts-types';
import { OADR3Client } from '../client.js';
import { tryParseBody, validateBody, validateBodyArray, validateParams } from './common.js';

export async function searchAllEvents(client: OADR3Client, params: OADR3.SearchAllEventsQueryParams)
    : Promise<Array<OADR3.Event> | undefined>
{
    const searchEvents = validateParams<OADR3.SearchAllEventsQueryParams>(OADR3.joiValidateSearchAllEvents, params);
    const { endpoint, headers } = await client.clientParams('events');

    const options = {
        headers,
        searchParams: searchEvents
    };

    let eventsBody;
    try {
        const _progs = await got.get(endpoint.href, options as any);
        eventsBody = _progs?.body;
    } catch (err: any) {
        throw new Error(`searchAllEvents FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }
    
    let events = tryParseBody<any[]>(eventsBody);
    return validateBodyArray<OADR3.Event>(OADR3.joiValidateEvent, events);
}

export async function createEvent(client: OADR3Client, event: OADR3.Event)
    : Promise<OADR3.Event | undefined>
{
    const _event = validateParams<OADR3.Event>(OADR3.joiValidateEvent, event);
    const { endpoint, headers } = await client.clientParams('events');

    let eventBody;
    try {
        const ret = await got.post(endpoint.href, {
            json: _event,
            headers
        });
        eventBody = ret?.body;
    } catch (err: any) {
        throw new Error(`createEvent FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(eventBody);
    return validateBody<OADR3.Event>(OADR3.joiValidateEvent, parsed);
}

export async function searchEventsByID(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Event | undefined>
{
    const eventID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    const { endpoint, headers } = await client.clientParams(path.join('events', eventID));

    let eventBody;
    try {
        const ret = await got.get(endpoint.href, {
            headers
        });
        eventBody = ret?.body;
    } catch (err: any) {
        throw new Error(`searchEventsByID FAIL GET ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(eventBody);
    return validateBody<OADR3.Event>(OADR3.joiValidateEvent, parsed);
}

export async function updateEvent(client: OADR3Client, event: OADR3.Event)
    : Promise<OADR3.Event | undefined>
{

    const _event = validateParams<OADR3.Event>(OADR3.joiValidateEvent, event);
    if (typeof _event.id === 'undefined') {
        throw new Error(`updateEvent Event object to be updated must have ID`);
    }
    const { endpoint, headers } = await client.clientParams(path.join('events', _event.id));

    let eventBody;
    try {
        const ret = await got.put(endpoint.href, {
            json: _event,
            headers
        });
        eventBody = ret?.body;
    } catch (err: any) {
        throw new Error(`updateEvent FAIL PUT ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(eventBody);
    return validateBody<OADR3.Event>(OADR3.joiValidateEvent, parsed);
}

export async function deleteEvent(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Event | undefined>
{
    const eventID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    const { endpoint, headers } = await client.clientParams(path.join('events', eventID));
   
    let eventBody;
    try {
        const ret = await got.delete(endpoint.href, {
            headers
        });
        eventBody = ret?.body;
    } catch (err: any) {
        throw new Error(`deleteEvent FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(eventBody);
    return validateBody<OADR3.Event>(OADR3.joiValidateEvent, parsed);
}
