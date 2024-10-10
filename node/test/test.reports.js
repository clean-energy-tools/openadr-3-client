
import util from 'node:util';
import * as OADR3 from 'openadr-3-ts-types';
import * as OADR3Client from '../dist/api.js';
import assert from 'node:assert';
import { describe, it, after } from 'node:test';

import { venClient, allClient } from './test.auth.js';

import { minProgram } from './test.programs.js';
import { minEvent } from './test.events.js';

export const minVen = {
    venName: 'George',
    attributes: []
};

export const minReport = {
    programID: '0',
    eventID: '0',
    clientName: 'client-999',
    reportName: 'TEST REPORT NAME',
    payloadDescriptors: [],
    resources: [
        {
            resourceName: 'George',
            intervals: [
                {
                    id: 0,
                    payloads: []
                }
            ]
        }
    ]
};

describe('Reports', async () => {

    // To test reports, we need both a program and an event object

    let progID;
    let program;
    await it('should create Program object', async () => {
        // load the program from a file
        const _program = structuredClone(minProgram);
        _program.programName = 'TEST PROGRAM FOR REPORTS';
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
        // console.log(`create ${util.inspect(_event)}`);
        const created = await allClient.createEvent(_event);
        const { error, value } = OADR3.joiValidateEvent(created);
        assert.ok(!error);
        eventID = created.id;
        event = created;
    });

    let venID;
    let ven;
    await it('should create Ven object', async () => {
        // load the program from a file
        const _ven = structuredClone(minVen);
        // console.log(`create ${util.inspect(_ven)}`);
        const created = await allClient.createVen(_ven);
        const { error, value } = OADR3.joiValidateVen(created);
        assert.ok(!error);
        venID = created.id;
        ven = created;
    });

    let reportID;
    let report;
    await it('should create a Report object', async () => {

        const _report = structuredClone(minReport);
        _report.programID = progID;
        _report.eventID   = eventID;
        const created = await allClient.createReport(_report);
        const { error, value } = OADR3.joiValidateReport(created);
        assert.ok(!error);
        reportID = created.id;
        report = created;
    });

    await it('should read created Report object by ID', async () => {
        const found = await allClient.searchReportsByReportID(reportID);
        const { error, value } = OADR3.joiValidateReport(found);
        assert.ok(!error);
    });

    await it('should search for created Report object by programID', async () => {
        try {
            const found = await allClient.searchAllReports({
                programID: progID
            });
            assert.ok(Array.isArray(found));
            assert.ok(found.length >= 1);
            for (const item of found) {
                const { error, value } = OADR3.joiValidateReport(item);
                if (error) {
                    console.error(error.details);
                }
                assert.ok(!error);
                assert.ok(value.programID === progID);
            }
        } catch (err) {
            console.error(err.stack);
            throw err;
        }
    });

    let modified;
    await it('should update Report object', async () => {
        // make a change to the program
        const _modified = structuredClone(report);
        _modified.reportName = 'MODIFIED report name';
        const m = await allClient.updateReport(_modified);
        // console.log(`updated event `, m);
        const { error, value } = OADR3.joiValidateReport(m);
        if (error) {
            console.log(error.details);
        }
        assert.ok(!error);
        // verify that modifications were made
        modified = m;
    });

    await it('should read updated Report object by ID', async () => {
        const found = await allClient.searchReportsByReportID(modified.id);
        const { error, value } = OADR3.joiValidateReport(found);
        assert.ok(!error);
        assert.ok(value.id === modified.id);
        assert.ok(value.reportName === modified.reportName);
    });

    await it('should delete Report object', async () => {
        const deleted = await allClient.deleteReport(modified.id);
        const { error, value } = OADR3.joiValidateReport(deleted);
        assert.ok(!error);
    });

    await it('should not find deleted Report object by ID', async () => {
        let errored = false;
        let found;
        try {
            found = await allClient.searchReportsByReportID(modified.id);
        } catch (err) {
            // console.log(err.stack);
            errored = true;
        }
        assert.ok(typeof found === 'undefined' || errored);
    });

    await it('should not find deleted Report object by event name', async () => {
        const found = await allClient.searchAllReports({
            programID: progID
        });
        // console.log(found);
        assert.ok(Array.isArray(found));
        let hasDeleted = false;
        for (const f of found) {
            if (f) {
                if (f.programID === modified.programID && f.id === modified.id) {
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
        try {
            const deleted = await allClient.deleteVen(venID);
        } catch (err) { }
        try {
            const found = await allClient.searchAllReports();
            for (const item of found) {
                const { error, value } = OADR3.joiValidateReport(item);
                await allClient.deleteReport(item.id);
            }
        } catch (err) { }
    });
});
