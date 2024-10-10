
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
        _program.programName += Math.floor(Math.random() * 1000).toString();
        // console.log(`create ${util.inspect(_program)}`);
        const created = await allClient.createProgram(_program);
        const { error, value } = OADR3.joiValidateProgram(created);
        assert.ok(!error);
        progID = created.id;
        program = created;
    });

    await it('should read created Program object by ID', async () => {
        const found = await allClient.searchProgramByProgramId(progID);
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
        const found = await allClient.searchAllPrograms({
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
        _modified.programName = 'MODIFIED program name ' + Math.floor(Math.random() * 1000).toString();
        const m = await allClient.updateProgram(_modified);
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
        const found = await allClient.searchProgramByProgramId(modified.id);
        const { error, value } = OADR3.joiValidateProgram(found);
        assert.ok(!error);
    });

    await it('should delete Program object', async () => {
        const deleted = await allClient.deleteProgram(modified.id);
        const { error, value } = OADR3.joiValidateProgram(deleted);
        assert.ok(!error);
    });

    await it('should not find deleted Program object by ID', async () => {
        let errored = false;
        let found;
        try {
            found = await allClient.searchProgramByProgramId(modified.id);
        } catch (err) {
            // console.log(err.stack);
            errored = true;
        }
        assert.ok(typeof found === 'undefined' || errored);
        // const { error, value } = OADR3.joiValidateProgram(found);
        // assert.ok(!error);
        // assert found == undefined
    });

    await it('should not find deleted Program object target group', async () => {
        const found = await allClient.searchAllPrograms({
            targetType: 'TEST'
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
    });
});
