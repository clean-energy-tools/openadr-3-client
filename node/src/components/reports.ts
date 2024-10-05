
import path from 'node:path';
import util from 'node:util';
import Joi from 'joi';
import got from 'got';
import * as OADR3 from 'openadr-3-ts-types';
import { OADR3Client } from '../client.js';
import { tryParseBody, validateBody, validateBodyArray, validateParams } from './common.js';

export async function searchAllReports(client: OADR3Client, params: OADR3.SearchAllReportsQueryParams)
    : Promise<Array<OADR3.Report> | undefined>
{
    const searchReports = validateParams<OADR3.SearchAllReportsQueryParams>(OADR3.joiValidateSearchAllReports, params);
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
        throw new Error(`searchAllReports FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }
    
    let _reports = tryParseBody<any[]>(reportsBody);
    return validateBodyArray<OADR3.Report>(OADR3.joiReport.validate, _reports);
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
        throw new Error(`createReport FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
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
        throw new Error(`searchReportsByReportID FAIL GET ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
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
        throw new Error(`updateReport FAIL PUT ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
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
        throw new Error(`deleteReport FAIL ${err?.code} ${err?.response?.statusCode} ${err?.response?.statusMessage} ${err?.message} ${err?.response?.requestUrl} ${err?.response?.body}`);
    }

    let parsed = tryParseBody<any>(reportBody);
    return validateBody<OADR3.Report>(OADR3.joiValidateReport, parsed);

}