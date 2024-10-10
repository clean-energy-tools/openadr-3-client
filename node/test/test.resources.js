
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

export const minResource = {
    resourceName: 'VEN1'
};

describe('RESOURCES', async () => {

    let venID;
    let ven;
    await it('should create Ven object', async () => {
        // load the program from a file
        const _ven = structuredClone(minVen);
        // console.log(`create ${util.inspect(_ven)}`);
        _ven.venName += (Math.floor(Math.random()*1000)).toString();
        const created = await allClient.createVen(_ven);
        const { error, value } = OADR3.joiValidateVen(created);
        assert.ok(!error);
        venID = created.id;
        ven = created;
    });

    let resourceID;
    let resource;
    await it('should create Resource object', async () => {
        // load the program from a file
        const _resource = structuredClone(minResource);
        _resource.venID = venID;
        _resource.resourceName += (Math.floor(Math.random()*1000)).toString();
        // console.log(`create ${util.inspect(_ven)}`);
        const created = await allClient.createResource(venID, _resource);
        const { error, value } = OADR3.joiValidateResource(created);
        assert.ok(!error);
        resourceID = created.id;
        resource = created;
    });

    await it('should read created Resource object by ID', async () => {
        const found = await allClient.searchVenResourceByID(venID, resourceID);
        const { error, value } = OADR3.joiValidateResource(found);
        assert.ok(!error);
    });

    await it('should search for created Resource object by resource name', async () => {
        const found = await allClient.searchVenResources(venID);
        assert.ok(Array.isArray(found));
        assert.ok(found.length >= 1);
        // console.log(resource);
        // console.log(found);
        let hasResource = false
        for (const item of found) {
            const { error, value } = OADR3.joiValidateResource(item);
            assert.ok(!error);
            if (item.resourceName === resource.resourceName) {
                hasResource = true;
            }
        }
        assert.ok(hasResource);
    });

    let modified;
    await it('should update Resource object', async () => {
        // make a change to the program
        const _modified = structuredClone(resource);
        _modified.resourceName = 'MODIFIED resource name';
        const m = await allClient.updateVenResource(venID, _modified);
        // console.log(`updated event `, m);
        const { error, value } = OADR3.joiValidateResource(m);
        if (error) {
            console.log(error.details);
        }
        assert.ok(!error);
        // verify that modifications were made
        assert.ok(value.resourceName === _modified.resourceName);
        modified = m;
    });

    await it('should read updated Resource object by ID', async () => {
        const found = await allClient.searchVenResourceByID(venID, modified.id);
        const { error, value } = OADR3.joiValidateResource(found);
        assert.ok(!error);
        assert.ok(value.resourceName === modified.resourceName);
    });

    await it('should delete Resource object', async () => {
        const deleted = await allClient.deleteVenResource(venID, modified.id);
        const { error, value } = OADR3.joiValidateResource(deleted);
        assert.ok(!error);
        assert.ok(value.resourceName === modified.resourceName);
    });

    await it('should not find deleted Event object by ID', async () => {
        let errored = false;
        let found;
        try {
            const found = await allClient.searchVenResourceByID(venID, modified.id);
        } catch (err) {
            // console.log(err.stack);
            errored = true;
        }
        assert.ok(typeof found === 'undefined' || errored);
    });

    await after(async () => {
        try {
            const deleted = await allClient.deleteVen(venID);
        } catch (err) { }
        try {
            const found = await allClient.searchAllResources();
            for (const item of found) {
                const { error, value } = OADR3.joiValidateResource(item);
                await allClient.deleteResource(item.venID, item.id);
            }
        } catch (err) { }
    });
});
