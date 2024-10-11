
import path from 'node:path';
import util from 'node:util';
import got from 'got';
import * as OADR3 from 'openadr-3-ts-types';
import { OADR3Client } from '../client.js';
import { OADR3Error, tryParseBody, validateBody, validateBodyArray, validateParams } from './common.js';

/**
 * Execute the searchAllPrograms operation on the server.
 * 
 * @param params 
 * @returns Array of Program objects
 */
export async function searchAllPrograms(client: OADR3Client, params: OADR3.SearchAllProgramsQueryParams)
    : Promise<Array<OADR3.Program> | undefined>
{
    const searchProgs = validateParams<OADR3.SearchAllProgramsQueryParams>(OADR3.joiValidateSearchAllPrograms, params);
    const { endpoint, headers } = await client.clientParams('programs');

    const options = {
        headers,
        searchParams: searchProgs
    };

    let progsBody;
    try {
        const _progs = await got.get(endpoint.href, options as any);
        progsBody = _progs?.body;
    } catch (err: any) {
        const t = new OADR3Error(`searchAllPrograms FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }
    
    let _programs = tryParseBody<any[]>(progsBody);
    return validateBodyArray<OADR3.Program>(OADR3.joiValidateProgram, _programs);
}

/**
 * Execute the createProgram operation on the server.
 *
 * @param program The Program to create
 * @returns The created Program object 
 */
export async function createProgram(client: OADR3Client, program: OADR3.Program)
    : Promise<OADR3.Program | undefined>
{
    const _program = validateParams<OADR3.Program>(OADR3.joiValidateProgram, program);
    const { endpoint, headers } = await client.clientParams('programs');

    // console.log(`createProgram ${endpoint.href} ${util.inspect(headers)} ${util.inspect(program)}`);

    let progBody;
    try {
        const ret = await got.post(endpoint.href, {
            json: _program,
            headers
        });
        progBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`createProgram FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(progBody);
    return validateBody<OADR3.Program>(OADR3.joiValidateProgram, parsed);
}

/**
 * Execute the searchProgramByProgramId function on the server.
 * @param id The ID of the program to fetch
 * @returns The Program object.
 */
export async function searchProgramByProgramId(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Program | undefined>
{
    const progID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    if (typeof progID === 'undefined') {
        console.warn(`searchProgramByProgramId id ${util.inspect(id)} ==> ${util.inspect(progID)} was undefined`);
    }
    const { endpoint, headers } = await client.clientParams(path.join('programs', progID));

    let progBody;
    try {
        const ret = await got.get(endpoint.href, {
            headers
        });
        progBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`searchProgramByProgramId FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(progBody);
    return validateBody<OADR3.Program>(OADR3.joiValidateProgram, parsed);
}

/**
 * Execute the updateProgram operation on the server.
 * @param program The Program object to update
 * @returns The updated Program object
 */
export async function updateProgram(client: OADR3Client, program: OADR3.Program)
    : Promise<OADR3.Program | undefined>
{
    const _program = validateParams<OADR3.Program>(OADR3.joiValidateProgram, program);
    if (typeof _program.id === 'undefined') {
        throw new Error(`updateProgram Program object to be updated must have ID`);
    }
    const { endpoint, headers } = await client.clientParams(path.join('programs', _program.id));

    let progBody;
    try {
        const ret = await got.put(endpoint.href, {
            json: _program,
            headers
        });
        progBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`updateProgram FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(progBody);
    return validateBody<OADR3.Program>(OADR3.joiValidateProgram, parsed);
}

/**
 * Execute the deleteProgram operation on the server.
 * @param id The ID for the Program object to delete
 * @returns The Program object which has been deleted
 */
export async function deleteProgram(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Program | undefined>
{
    const progID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, id);
    const { endpoint, headers } = await client.clientParams(path.join('programs', progID));
   
    let progBody;
    try {
        const ret = await got.delete(endpoint.href, {
            headers
        });
        progBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`deleteProgram FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(progBody);
    return validateBody<OADR3.Program>(OADR3.joiValidateProgram, parsed);
}
