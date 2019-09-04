/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class IbpsimplemsgContract extends Contract {

    async ibpsimplemsgExists(ctx, ibpsimplemsgId) {
        const buffer = await ctx.stub.getState(ibpsimplemsgId);
        return (!!buffer && buffer.length > 0);
    }

    async createIbpsimplemsg(ctx, ibpsimplemsgId, value) {
        const exists = await this.ibpsimplemsgExists(ctx, ibpsimplemsgId);
        if (exists) {
            throw new Error(`The ibpsimplemsg ${ibpsimplemsgId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(ibpsimplemsgId, buffer);
    }

    async readIbpsimplemsg(ctx, ibpsimplemsgId) {
        const exists = await this.ibpsimplemsgExists(ctx, ibpsimplemsgId);
        if (!exists) {
            throw new Error(`The ibpsimplemsg ${ibpsimplemsgId} does not exist`);
        }
        const buffer = await ctx.stub.getState(ibpsimplemsgId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateIbpsimplemsg(ctx, ibpsimplemsgId, newValue) {
        const exists = await this.ibpsimplemsgExists(ctx, ibpsimplemsgId);
        if (!exists) {
            throw new Error(`The ibpsimplemsg ${ibpsimplemsgId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(ibpsimplemsgId, buffer);
    }

    async deleteIbpsimplemsg(ctx, ibpsimplemsgId) {
        const exists = await this.ibpsimplemsgExists(ctx, ibpsimplemsgId);
        if (!exists) {
            throw new Error(`The ibpsimplemsg ${ibpsimplemsgId} does not exist`);
        }
        await ctx.stub.deleteState(ibpsimplemsgId);
    }

}

module.exports = IbpsimplemsgContract;
