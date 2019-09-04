/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { IbpsimplemsgContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('IbpsimplemsgContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new IbpsimplemsgContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"ibpsimplemsg 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"ibpsimplemsg 1002 value"}'));
    });

    describe('#ibpsimplemsgExists', () => {

        it('should return true for a ibpsimplemsg', async () => {
            await contract.ibpsimplemsgExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a ibpsimplemsg that does not exist', async () => {
            await contract.ibpsimplemsgExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createIbpsimplemsg', () => {

        it('should create a ibpsimplemsg', async () => {
            await contract.createIbpsimplemsg(ctx, '1003', 'ibpsimplemsg 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"ibpsimplemsg 1003 value"}'));
        });

        it('should throw an error for a ibpsimplemsg that already exists', async () => {
            await contract.createIbpsimplemsg(ctx, '1001', 'myvalue').should.be.rejectedWith(/The ibpsimplemsg 1001 already exists/);
        });

    });

    describe('#readIbpsimplemsg', () => {

        it('should return a ibpsimplemsg', async () => {
            await contract.readIbpsimplemsg(ctx, '1001').should.eventually.deep.equal({ value: 'ibpsimplemsg 1001 value' });
        });

        it('should throw an error for a ibpsimplemsg that does not exist', async () => {
            await contract.readIbpsimplemsg(ctx, '1003').should.be.rejectedWith(/The ibpsimplemsg 1003 does not exist/);
        });

    });

    describe('#updateIbpsimplemsg', () => {

        it('should update a ibpsimplemsg', async () => {
            await contract.updateIbpsimplemsg(ctx, '1001', 'ibpsimplemsg 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"ibpsimplemsg 1001 new value"}'));
        });

        it('should throw an error for a ibpsimplemsg that does not exist', async () => {
            await contract.updateIbpsimplemsg(ctx, '1003', 'ibpsimplemsg 1003 new value').should.be.rejectedWith(/The ibpsimplemsg 1003 does not exist/);
        });

    });

    describe('#deleteIbpsimplemsg', () => {

        it('should delete a ibpsimplemsg', async () => {
            await contract.deleteIbpsimplemsg(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a ibpsimplemsg that does not exist', async () => {
            await contract.deleteIbpsimplemsg(ctx, '1003').should.be.rejectedWith(/The ibpsimplemsg 1003 does not exist/);
        });

    });

});