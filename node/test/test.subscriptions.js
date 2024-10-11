import util from 'node:util';
import * as OADR3 from 'openadr-3-ts-types';
import * as OADR3Client from '../dist/api.js';
import assert from 'node:assert';
import { describe, it, after } from 'node:test';

import { venClient, allClient } from './test.auth.js';

import { minProgram } from './test.programs.js';

export const minSub = {
    programID: '0',
    clientName: 'Harry',
    objectOperations: [
        {
            objects: [],
            operations: [],
            callbackUrl: 'https://some.where.com/foo/'
        }
    ]
};

describe('SUBSCRIPTIONS', async () => {

    let progID;
    let program;
    await it('should create Program object', async () => {
        // load the program from a file
        const _program = structuredClone(minProgram);
        _program.programName = 'TEST PROGRAM FOR EVENTS ' + Math.floor(Math.random() * 1000).toString();
        // console.log(`create ${util.inspect(_program)}`);
        const created = await allClient.createProgram(_program);
        const { error, value } = OADR3.joiValidateProgram(created);
        assert.ok(!error);
        assert.ok(typeof value !== 'undefined');
        assert.ok(typeof value.id === 'string');
        progID = created.id;
        program = created;
    });

    let subscriptionID;
    let subscription;
    await it('should create Subscription object', async () => {
        // load the program from a file
        const _sub = structuredClone(minSub);
        _sub.programID = progID;
        // console.log(`before createEvent ${util.inspect(_event)}`);
        const created = await allClient.createSubscription(_sub);
        const { error, value } = OADR3.joiValidateSubscription(created);
        assert.ok(!error);
        assert.ok(typeof value !== 'undefined');
        assert.ok(typeof value.id === 'string');
        subscriptionID = created.id;
        subscription = created;
    });

    await it('should read created Subscription object by ID', async () => {
        const found = await allClient.searchSubscriptionByID(subscriptionID);
        const { error, value } = OADR3.joiValidateSubscription(found);
        assert.ok(!error);
        assert.ok(found.id === subscription.id);
    });

    await it('should search for created Subscription object by client name', async () => {
        const found = await allClient.searchSubscriptions({
            clientName: 'Harry'
        });
        assert.ok(Array.isArray(found));
        assert.ok(found.length >= 1);
        for (const item of found) {
            const { error, value } = OADR3.joiValidateSubscription(item);
            assert.ok(!error);
        }
    });

    let modified;
    await it('should update Subscription object', async () => {
        // make a change to the program
        const _modified = structuredClone(subscription);
        _modified.clientName = 'MODIFIED client name';
        const m = await allClient.updateSubscription(_modified);
        // console.log(`updated event `, m);
        const { error, value } = OADR3.joiValidateSubscription(m);
        if (error) {
            console.log(error.details);
        }
        assert.ok(!error);
        // verify that modifications were made
        assert.ok(m.clientName === 'MODIFIED client name');
        modified = m;
    });

    await it('should read updated Subscription object by ID', async () => {
        const found = await allClient.searchSubscriptionByID(modified.id);
        const { error, value } = OADR3.joiValidateSubscription(found);
        assert.ok(!error);
        assert.ok(value.clientName === 'MODIFIED client name');
    });

    await it('should search for created Subscription object by modified client name', async () => {
        const found = await allClient.searchSubscriptions({
            clientName: 'MODIFIED client name'
        });
        assert.ok(Array.isArray(found));
        assert.ok(found.length >= 1);
        for (const item of found) {
            const { error, value } = OADR3.joiValidateSubscription(item);
            assert.ok(!error);
        }
    });

    await it('should delete Subscription object', async () => {
        const deleted = await allClient.deleteSubscription(modified.id);
        const { error, value } = OADR3.joiValidateSubscription(deleted);
        assert.ok(!error);
    });

    await it('should not find deleted Subscription object by ID', async () => {
        let errored = false;
        let found;
        try {
            found = await allClient.searchSubscriptionByID(modified.id);
        } catch (err) {
            // console.log(err.stack);
            errored = true;
        }
        assert.ok(typeof found === 'undefined' || errored);
    });

    await it('should not find deleted Subscription object by client name', async () => {
        const found = await allClient.searchSubscriptions({
            clientName: 'MODIFIED client name'
        });
        // console.log(found);
        assert.ok(Array.isArray(found));
        let hasDeleted = false;
        for (const f of found) {
            if (f) {
                if (f.id === modified.id) {
                    hasDeleted = true;
                }
            }
        }
        assert.ok(hasDeleted === false);
    });

    await after(async () => {
        try {
            const deleted = await allClient.deleteProgram(progID);
        } catch (err) { }
        try {
            const found = await allClient.searchSubscriptions();
            for (const item of found) {
                const { error, value } = OADR3.joiValidateSubscription(item);
                await allClient.deleteSubscription(item.id);
            }
        } catch (err) { }
    });
});
