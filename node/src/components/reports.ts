
import path from 'node:path';
import util from 'node:util';
import Joi from 'joi';
import got from 'got';
import * as OADR3 from 'openadr-3-ts-types';
import { OADR3Client } from '../client.js';
import { OADR3Error, tryParseBody, validateBody, validateBodyArray, validateParams } from './common.js';

import { schemas } from 'openadr-3-ts-types/dist/joi/oadr3.js';

export async function searchAllReports(client: OADR3Client, params: OADR3.SearchAllReportsQueryParams)
    : Promise<Array<OADR3.Report> | undefined>
{
    ////// COPY IN CODE FROM validateParams
    const { error, value } =  OADR3.joiSearchAllReports.validate(params);
            // schemas.parameters.searchAllReports.query.validate(params);
    if (error) {
        throw new Error(`bad parameters ${util.inspect(error.details)}`);
    }
 
    const searchReports = value as OADR3.SearchAllReportsQueryParams; // validateParams<OADR3.SearchAllReportsQueryParams>(OADR3.joiSearchAllReports.validate, params);
    const { endpoint, headers } = await client.clientParams('reports');

    const options = {
        headers,
        searchParams: searchReports
    };

    let reportsBody;
    try {
        const _reports = await got.get(endpoint.href, options);
        reportsBody = _reports?.body;
    } catch (err: any) {
        const t = new OADR3Error(`searchAllReports FAIL GET ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }
    
    let _reports = tryParseBody<any[]>(reportsBody);
    // console.log(`searchAllReports check return value ${util.inspect(_reports)}`);

    //////////// Copy in code from validateBodyArray
    const reports = new Array<OADR3.Report>();
    if (_reports) {
        for (const report of _reports) {
            if (typeof report === 'undefined' || report === null) {
                console.warn(`validateBodyArray item undefined or null in ${util.inspect(_reports)}`);
            }
            // console.log(`validateBodyArray item ${util.inspect(report)}`);
            const { error, value } = OADR3.joiReport.validate(report);
            if (error) {
                throw new Error(`validateBodyArray FAIL VALIDATION ${util.inspect(error.details)}`);
            }
            reports.push(value as OADR3.Report);
        }
    }
    return reports;
    // return validateBodyArray<OADR3.Report>(OADR3.joiReport.validate, _reports);
}

export async function createReport(client: OADR3Client, report: OADR3.Report)
    : Promise<OADR3.Report | undefined>
{
    const _report = validateParams<OADR3.Report>(OADR3.joiValidateReport, report);
    const { endpoint, headers } = await client.clientParams('reports');

    let reportBody;
    try {
        const ret = await got.post(endpoint.href, {
            json: _report,
            headers
        });
        reportBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`createReport FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(reportBody);
    return validateBody<OADR3.Report>(OADR3.joiValidateReport, parsed);
}

export async function searchReportsByReportID(client: OADR3Client, reportID: OADR3.ObjectID)
    : Promise<OADR3.Report | undefined>
{
    reportID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, reportID);
    const { endpoint, headers } = await client.clientParams(path.join('reports', reportID));

    let reportBody;
    try {
        const ret = await got.get(endpoint.href, {
            headers
        });
        reportBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`searchReportsByReportID FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(reportBody);
    return validateBody<OADR3.Report>(OADR3.joiValidateReport, parsed);
}

export async function updateReport(client: OADR3Client, report: OADR3.Report)
    : Promise<OADR3.Report | undefined>
{
    const _report = validateParams<OADR3.Report>(OADR3.joiValidateReport, report);
    if (typeof _report.id === 'undefined') {
        throw new Error(`updateReport Report object to be updated must have ID`);
    }
    const { endpoint, headers } = await client.clientParams(path.join('reports', _report.id));

    let reportBody;
    try {
        const ret = await got.put(endpoint.href, {
            json: _report,
            headers
        });
        reportBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`updateReport FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(reportBody);
    return validateBody<OADR3.Report>(OADR3.joiValidateReport, parsed);
}

export async function deleteReport(client: OADR3Client, reportID: OADR3.ObjectID)
    : Promise<OADR3.Report | undefined>
{
    reportID = validateParams<OADR3.ObjectID>(OADR3.joiValidateObjectID, reportID);
    const { endpoint, headers } = await client.clientParams(path.join('reports', reportID));
  
    let reportBody;
    try {
        const ret = await got.delete(endpoint.href, {
            headers
        });
        reportBody = ret?.body;
    } catch (err: any) {
        const t = new OADR3Error(`deleteReport FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl}`);
        t.code = err.code;
        throw t;
    }

    let parsed = tryParseBody<any>(reportBody);
    return validateBody<OADR3.Report>(OADR3.joiValidateReport, parsed);

}
