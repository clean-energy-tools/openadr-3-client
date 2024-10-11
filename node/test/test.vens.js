import util from 'node:util';
import * as OADR3 from 'openadr-3-ts-types';
import * as OADR3Client from '../dist/api.js';
import assert from 'node:assert';
import { describe, it, after } from 'node:test';

import { venClient, allClient } from './test.auth.js';

export const minVen = {
    venName: 'George',
    targets: [ { type: 'TARGETED', values: [] } ]
};

describe('VENS', async () => {

    let venID;
    let ven;
    await it('should create Ven object', async () => {
        // load the program from a file
        const _ven = structuredClone(minVen);
        // console.log(`create ${util.inspect(_ven)}`);
        const created = await allClient.createVen(_ven);
        const { error, value } = OADR3.joiValidateVen(created);
        assert.ok(!error);
        assert.ok(created.venName === _ven.venName);
        venID = created.id;
        ven = created;
    });

    await it('should read created Ven object by ID', async () => {
        const found = await allClient.searchVenByID(venID);
        const { error, value } = OADR3.joiValidateVen(found);
        assert.ok(!error);
        assert.ok(found.venName === ven.venName);
    });

    await it('should search for created Ven object by ven target name', async () => {
        const found = await allClient.searchVens({
            targetType: 'TARGETED'
        });
        assert.ok(Array.isArray(found));
        assert.ok(found.length >= 1);
        for (const item of found) {
            const { error, value } = OADR3.joiValidateVen(item);
            assert.ok(!error);
        }
    });

    let modified;
    await it('should update Ven object', async () => {
        // make a change to the program
        const _modified = structuredClone(ven);
        _modified.venName = 'MODIFIED Ven name';
        const m = await allClient.updateVen(_modified);
        // console.log(`updated event `, m);
        const { error, value } = OADR3.joiValidateVen(m);
        if (error) {
            console.log(error.details);
        }
        assert.ok(!error);
        // verify that modifications were made
        assert.ok(value.venName === _modified.venName);
        modified = m;
    });

    await it('should read updated Ven object by ID', async () => {
        const found = await allClient.searchVenByID(modified.id);
        const { error, value } = OADR3.joiValidateVen(found);
        assert.ok(!error);
    });

    await it('should search for modified Ven object by ven target name', async () => {
        const found = await allClient.searchVens({
            targetType: 'TARGETED'
        });
        assert.ok(Array.isArray(found));
        assert.ok(found.length >= 1);
        for (const item of found) {
            const { error, value } = OADR3.joiValidateVen(item);
            assert.ok(!error);
            assert.ok(value.id === modified.id);
        }
    });

    await it('should delete Ven object', async () => {
        const deleted = await allClient.deleteVen(modified.id);
        const { error, value } = OADR3.joiValidateVen(deleted);
        assert.ok(!error);
    });

    await it('should not find deleted Ven object by ID', async () => {
        let errored = false;
        let found;
        try {
            found = await allClient.searchVenByID(modified.id);
        } catch (err) {
            // console.log(err.stack);
            errored = true;
        }
        assert.ok(typeof found === 'undefined' || errored);
    });

    await it('should not find deleted Ven object by target name', async () => {
        const found = await allClient.searchVens({
            targetType: 'TARGETED'
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
            const found = await allClient.searchVens();
            for (const item of found) {
                const { error, value } = OADR3.joiValidateVen(item);
                await allClient.deleteVen(item.id);
            }
        } catch (err) { }
    });
});
