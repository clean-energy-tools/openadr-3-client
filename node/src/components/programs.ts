
import path from 'node:path';
import util from 'node:util';
import got from 'got';
import * as OADR3 from 'openadr-3-ts-types';
// import { authHeaders } from './auth.js';
// import { oadr3EndpointURL } from '../api.js';
import { OADR3Client } from '../client.js';

/**
 * Execute the searchAllPrograms operation on the server.
 * 
 * @param params 
 * @returns Array of Program objects
 */
export async function searchAllPrograms(client: OADR3Client, params: OADR3.SearchAllEventsQueryParams)
    : Promise<Array<OADR3.Program> | undefined>
{
    const { error, value } = OADR3.joiSearchAllPrograms.query.validate(params);
    if (error) {
        throw new Error(`searchAllPrograms bad parameters ${util.inspect(error.details)}`);
    }

    const endpoint = client.endpointURL('programs');
    const headers = await client.authHeaders();
    const ccrequest = value as OADR3.ClientCredentialRequest;

    const options = {
        headers,
        searchParams: ccrequest
    };
    // console.log(`searchAllPrograms `, options);
    let progsBody;
    try {
        const _progs = await got.get(endpoint.href, options);
        progsBody = _progs?.body;
    } catch (err: any) {
        throw new Error(`searchAllPrograms FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }
    
    if (typeof progsBody === 'undefined') {
        return undefined;
    }

    let _progs;
    try {
        _progs = JSON.parse(progsBody)
    } catch (err: any) {
        throw new Error(`searchAllPrograms FAIL ${err?.message}`);
    }

    const progs = new Array<OADR3.Program>();
    for (const prog of _progs) {
        const { error, value } = OADR3.joiProgram.validate(prog);
        if (error) {
            throw new Error(`searchAllPrograms FAIL VALIDATION ${util.inspect(error.details)}`);
        }
        progs.push(value as OADR3.Program);
    }
    return progs;
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
    let { error, value } = OADR3.joiProgram.validate(program, {
        allowUnknown: true
    });
    if (error) {
        throw new Error(`createProgram bad parameters ${util.inspect(error.details)}`);
    }

    const endpoint = client.endpointURL('programs');
    const headers = await client.authHeaders();
    const _program = value as OADR3.Program;

    let progBody;
    try {
        const ret = await got.post(endpoint.href, {
            json: _program,
            headers
        });
        progBody = ret?.body;
    } catch (err: any) {
        throw new Error(`createProgram FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let _prog;
    try {
        _prog = JSON.parse(progBody)
    } catch (err: any) {
        throw new Error(`createProgram FAIL ${err?.message}`);
    }

    // console.log(`createProgram parsed program from server`, _prog);

    const valid = OADR3.joiProgram.validate(_prog, {
        allowUnknown: true
    });
    if (valid.error) {
        throw new Error(`createProgram FAIL VALIDATION ${util.inspect(valid.error.details)}`);
    }

    return valid.value as OADR3.Program;
}

/**
 * Execute the searchProgramByProgramId function on the server.
 * @param id The ID of the program to fetch
 * @returns The Program object.
 */
export async function searchProgramByProgramId(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Program | undefined>
{
    let { error, value } = OADR3.joiObjectID.validate(id);
    if (error) {
        throw new Error(`searchProgramByProgramId bad parameters ${util.inspect(error.details)}`);
    }

    const progID = value as OADR3.ObjectID;
    const endpoint = client.endpointURL(path.join('programs', progID));
    const headers = await client.authHeaders();

    let progBody;
    try {
        const ret = await got.get(endpoint.href, {
            headers
        });
        progBody = ret?.body;
    } catch (err: any) {
        throw new Error(`searchProgramByProgramId FAIL GET ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    if (typeof progBody === 'undefined') {
        return undefined;
    }

    let _prog;
    try {
        _prog = JSON.parse(progBody)
    } catch (err: any) {
        throw new Error(`searchProgramByProgramId FAIL ${err?.message}`);
    }

    const valid = OADR3.joiValidateProgram(_prog);
    if (valid.error) {
        throw new Error(`searchProgramByProgramId FAIL VALIDATION ${util.inspect(valid.error.details)}`);
    }

    return valid.value as OADR3.Program;
}

/**
 * Execute the updateProgram operation on the server.
 * @param program The Program object to update
 * @returns The updated Program object
 */
export async function updateProgram(client: OADR3Client, program: OADR3.Program)
    : Promise<OADR3.Program>
{
    let { error, value } = OADR3.joiValidateProgram(program);
    if (error) {
        throw new Error(`updateProgram bad parameters ${util.inspect(error.details)}`);
    }

    const _program = value as OADR3.Program;
    if (typeof _program.id === 'undefined') {
        throw new Error(`updateProgram Program object to be updated must have ID`);
    }
    const endpoint = client.endpointURL(path.join('programs', _program.id));
    const headers = await client.authHeaders();

    let progBody;
    try {
        const ret = await got.put(endpoint.href, {
            json: _program,
            headers
        });
        progBody = ret?.body;
    } catch (err: any) {
        throw new Error(`updateProgram FAIL PUT ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let _prog;
    try {
        _prog = JSON.parse(progBody)
    } catch (err: any) {
        throw new Error(`updateProgram FAIL PARSE ${err?.message}`);
    }

    const valid = OADR3.joiValidateProgram(_prog);
    if (valid.error) {
        throw new Error(`updateProgram FAIL VALIDATION ${util.inspect(valid.error.details)}`);
    }

    return valid.value as OADR3.Program;
}

/**
 * Execute the deleteProgram operation on the server.
 * @param id The ID for the Program object to delete
 * @returns The Program object which has been deleted
 */
export async function deleteProgram(client: OADR3Client, id: OADR3.ObjectID)
    : Promise<OADR3.Program | undefined>
{
    let { error, value } = OADR3.joiObjectID.validate(id);
    if (error) {
        throw new Error(`deleteProgram bad parameters ${util.inspect(error.details)}`);
    }

    const progID = value as OADR3.ObjectID;
    const endpoint = client.endpointURL(path.join('programs', progID));
    const headers = await client.authHeaders();
   
    let progBody;
    try {
        const ret = await got.delete(endpoint.href, {
            headers
        });
        progBody = ret?.body;
    } catch (err: any) {
        throw new Error(`deleteProgram FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    if (typeof progBody === 'undefined') {
        return undefined;
    }

    let _prog;
    try {
        _prog = JSON.parse(progBody)
    } catch (err: any) {
        throw new Error(`deleteProgram FAIL ${err?.message}`);
    }

    const valid = OADR3.joiValidateProgram(_prog);
    if (valid.error) {
        throw new Error(`deleteProgram FAIL VALIDATION ${util.inspect(valid.error.details)}`);
    }

    return valid.value as OADR3.Program;
}
