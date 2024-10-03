
import util from 'node:util';
import * as OADR3 from 'openadr-3-ts-types';
import * as OADR3Client from '../dist/api.js';
import assert from 'node:assert';
import { describe, it, after } from 'node:test';

import { venClient, allClient } from './test.auth.js';

export const minProgram = {
    programName: 'Test program',
    targetType: 'TEST'
} /* as OADR3.Program */;

describe('Programs', async () => {

    let progID;
    let program;
    await it('should create Program object', async () => {
        // load the program from a file
        const _program = structuredClone(minProgram);
        // console.log(`create ${util.inspect(_program)}`);
        const created = await OADR3Client.createProgram(allClient, _program);
        const { error, value } = OADR3.joiValidateProgram(created);
        assert.ok(!error);
        progID = created.id;
        program = created;
    });

    await it('should read created Program object by ID', async () => {
        const found = await OADR3Client.searchProgramByProgramId(allClient, progID);
        const { error, value } = OADR3.joiValidateProgram(found);
        assert.ok(!error);
    });

    // await it('should search for created Program object by target group', async () => {
    //     const found = await OADR3Client.searchAllPrograms(allClient, {
    //         // programID: progID
    //     });
    //     // .. assert isArray
    //     // .. assert length === 1
    //     const { error, value } = OADR3.joiValidateProgram(found[0]);
    //     assert.ok(!error);
    // });

    await it('should search for created Program object by target group', async () => {
        const found = await OADR3Client.searchAllPrograms(allClient, {
            targetType: 'TEST'
        });
        assert.ok(Array.isArray(found));
        assert.ok(found.length >= 1);
        for (const item of found) {
            const { error, value } = OADR3.joiValidateProgram(item);
            assert.ok(!error);
        }
    });
    
    let modified;
    await it('should update Program object', async () => {
        // make a change to the program
        const _modified = structuredClone(program);
        _modified.programName = 'MODIFIED program name';
        const m = await OADR3Client.updateProgram(allClient, _modified);
        // console.log(`updated program `, m);
        const { error, value } = OADR3.joiValidateProgram(m);
        if (error) {
            console.log(error.details);
        }
        assert.ok(!error);
        // verify that modifications were made
        modified = m;
    });

    await it('should read updated Program object by ID', async () => {
        const found = await OADR3Client.searchProgramByProgramId(allClient, modified.id);
        const { error, value } = OADR3.joiValidateProgram(found);
        assert.ok(!error);
    });

    await it('should delete Program object', async () => {
        const deleted = await OADR3Client.deleteProgram(allClient, modified.id);
        const { error, value } = OADR3.joiValidateProgram(deleted);
        assert.ok(!error);
    });

    await it('should not find deleted Program object by ID', async () => {
        let errored = false;
        let found;
        try {
            found = await OADR3Client.searchProgramByProgramId(allClient, modified.id);
        } catch (err) {
            // console.log(err.stack);
            errored = true;
        }
        assert.ok(errored);
        // const { error, value } = OADR3.joiValidateProgram(found);
        // assert.ok(!error);
        // assert found == undefined
    });

    await it('should not find deleted Program object target group', async () => {
        const found = await OADR3Client.searchAllPrograms(allClient, {
            targetType: 'TEST'
        });
        assert.ok(Array.isArray(found));
        assert.ok(found.length <= 0);
    });

    await after(async () => {
        try {
            const deleted = await OADR3Client.deleteProgram(allClient, progID);
        } catch (err) { }
    });
});
