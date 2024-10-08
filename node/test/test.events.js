
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
        _program.programName = 'TEST PROGRAM FOR EVENTS';
        // console.log(`create ${util.inspect(_program)}`);
        const created = await allClient.createProgram(_program);
        const { error, value } = OADR3.joiValidateProgram(created);
        assert.ok(!error);
        progID = created.id;
        program = created;
    });

    let eventID;
    let event;
    await it('should create Event object', async () => {
        // load the program from a file
        const _event = structuredClone(minEvent);
        _event.programID = progID;
        console.log(`create ${util.inspect(_event)}`);
        const created = await allClient.createEvent(_event);
        const { error, value } = OADR3.joiValidateEvent(created);
        assert.ok(!error);
        eventID = created.id;
        event = created;
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
