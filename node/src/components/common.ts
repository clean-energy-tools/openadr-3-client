
import util from 'node:util';
import Joi from 'joi';

export function validateParams<T>(validator: (data: any) => Joi.ValidationResult<any>, params: T): T {
    const { error, value } = validator(params);
    if (error) {
        throw new Error(`bad parameters ${util.inspect(error.details)}`);
    }
    return value as T;
}

export function tryParseBody<T>(body?: any): T | undefined {

    if (typeof body === 'undefined') {
        return undefined;
    }

    try {
        return JSON.parse(body) as T;
    } catch (err: any) {
        throw new Error(`tryParseBody FAIL ${err?.message}`);
    }
}

export function validateBodyArray<T>(validator: (data: any) => any, items: any[] | undefined)
{
    const reports = new Array<T>();
    if (items) {
        for (const report of items) {
            const { error, value } = validator(report);
            if (error) {
                throw new Error(`validateBodyArray FAIL VALIDATION ${util.inspect(error.details)}`);
            }
            reports.push(value as T);
        }
    }
    return reports;
}

export function validateBody<T>(validator: (data: any) => any, item: any | undefined)
{
    if (item) {
        const { error, value } = validator(item);
        if (error) {
            throw new Error(`validateBody FAIL VALIDATION ${util.inspect(error.details)}`);
        }
        return value as T;
    }
}