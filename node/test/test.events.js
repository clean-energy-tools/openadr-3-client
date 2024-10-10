
import util from 'node:util';
import * as OADR3 from 'openadr-3-ts-types';
import * as OADR3Client from '../dist/api.js';
import assert from 'node:assert';
import { describe, it, after } from 'node:test';

import { venClient, allClient } from './test.auth.js';

import { minProgram } from './test.programs.js';
export const minEvent = {
    eventName: 'TEST EVENT',
    intervals: [
        {
            id: 0,
            payloads: []
        }
    ]
};

describe('Events', async () => {

    // To test events, we need a program object

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

    let eventID;
    let event;
    await it('should create Event object', async () => {
        // load the program from a file
        const _event = structuredClone(minEvent);
        _event.programID = progID;
        // console.log(`before createEvent ${util.inspect(_event)}`);
        const created = await allClient.createEvent(_event);
        const { error, value } = OADR3.joiValidateEvent(created);
        assert.ok(!error);
        assert.ok(typeof value !== 'undefined');
        assert.ok(typeof value.id === 'string');
        eventID = created.id;
        event = created;
    });

    await it('should read created Event object by ID', async () => {
        const found = await allClient.searchEventsByID(eventID);
        const { error, value } = OADR3.joiValidateEvent(found);
        assert.ok(!error);
    });

    await it('should search for created Event object by event name', async () => {
        const found = await allClient.searchAllEvents({
            eventName: 'TEST EVENT'
        });
        assert.ok(Array.isArray(found));
        assert.ok(found.length >= 1);
        for (const item of found) {
            const { error, value } = OADR3.joiValidateEvent(item);
            assert.ok(!error);
        }
    });

    let modified;
    await it('should update Event object', async () => {
        // make a change to the program
        const _modified = structuredClone(event);
        _modified.eventName = 'MODIFIED event name';
        const m = await allClient.updateEvent(_modified);
        // console.log(`updated event `, m);
        const { error, value } = OADR3.joiValidateEvent(m);
        if (error) {
            console.log(error.details);
        }
        assert.ok(!error);
        // verify that modifications were made
        modified = m;
    });

    await it('should read updated Event object by ID', async () => {
        const found = await allClient.searchEventsByID(modified.id);
        const { error, value } = OADR3.joiValidateEvent(found);
        assert.ok(!error);
    });

    await it('should delete Event object', async () => {
        const deleted = await allClient.deleteEvent(modified.id);
        const { error, value } = OADR3.joiValidateEvent(deleted);
        assert.ok(!error);
    });

    await it('should not find deleted Event object by ID', async () => {
        let errored = false;
        let found;
        try {
            found = await allClient.searchEventsByID(modified.id);
        } catch (err) {
            // console.log(err.stack);
            errored = true;
        }
        assert.ok(typeof found === 'undefined' || errored);
    });

    await it('should not find deleted Event object by event name', async () => {
        const found = await allClient.searchAllEvents({
            eventName: 'TEST EVENT'
        });
        // console.log(found);
        assert.ok(Array.isArray(found));
        let hasDeleted = false;
        for (const f of found) {
            if (f) {
                if (f.id === program.id || f.id === modified.id) {
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
            const deleted = await allClient.deleteEvent(eventID);
        } catch (err) { }
    });
});
