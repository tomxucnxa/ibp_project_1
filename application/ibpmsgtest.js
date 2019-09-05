/**
  * SPDX-License-Identifier: Apache-2.0
 */

/**
 * This is an example based on fabric-sdk-node, it refers content of:
 * https://fabric-sdk-node.github.io/master/index.html
 * https://github.com/hyperledger/fabric-sdk-node
 * https://fabric-sdk-node.github.io/master/tutorial-network-config.html
 * 
 * This program uses connprofile.json, what is a common connection profile.
 * It will utilze FileSystemWallet and Gateway, what is from fabric-network module.
 */

'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { Gateway, FileSystemWallet, X509WalletMixin } = require('fabric-network');

var logger = new (winston.Logger)({ transports: [new (winston.transports.Console)()] });

let arg = process.argv[2];

switch (arg) {
    case 'query': testQuery(process.argv[3]); break;
    case 'invoke': testTransaction(); break;
    default: testInvokeThenQuery(); break;
}

async function testInvokeThenQuery() {
    let msgId = await testTransaction();
    await testQuery(msgId);
}

async function testQuery(msgId) {
    logger.info('==== Begin query ' + msgId);
    const identityLabel = 'Admin Org1';
    const wallet = await initAdminWallet(identityLabel);
    const gateway = new Gateway();

    await gateway.connect(path.join(__dirname, './connections/mychannel_ibpsimplemsg_profile.json'),
        {
            wallet: wallet,
            identity: identityLabel,
            discovery: { enabled: true, asLocalhost: false }
        });

    logger.info('Gateway connects get succeed in query testing.');

    const network = await gateway.getNetwork('mychannel');
    const contract = await network.getContract('simplemsg');
    const result = await contract.evaluateTransaction('readSimplemsg', msgId);
    gateway.disconnect();

    logger.info('Query Result', Buffer.from(result).toString());
}

async function testTransaction(msgId, msg) {
    try {
        logger.info('==== Begin transaction');
        const identityLabel = 'admin@org1';
        const wallet = await initAdminWallet(identityLabel);
        const gateway = new Gateway();

        await gateway.connect(path.join(__dirname, './connections/mychannel_simplemsg_profile.json'),
            {
                wallet: wallet,
                identity: identityLabel,
                discovery: { enabled: true, asLocalhost: false }
            });

        logger.info('Gateway connects get succeed.');

        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract('simplemsg');
        if (!msgId) {
            msgId = getRandomId();
        }
        if (!msg) {
            msg = "MSG_" + msgId;
        }
        logger.info('Create', msgId, msg);
        const result = await contract.submitTransaction("createSimplemsg", msgId, msg);
        gateway.disconnect();

        logger.info('Transaction Result', Buffer.from(result).toString());
        return msgId;
    }
    catch (e) {
        console.error(e);
    }
}

function getRandomId() {
    return Math.random().toString().substring(2).substring(0, 8);
}

async function initAdminWallet(identityLabel) {
    const keyPath = path.join(__dirname, "./identities/private_key.pem");
    const keyPEM = Buffer.from(fs.readFileSync(keyPath)).toString();
    const certPath = path.join(__dirname, "./identities/certificate.pem");
    const certPEM = Buffer.from(fs.readFileSync(certPath)).toString();

    const mspId = 'msporg1';
    const identity = X509WalletMixin.createIdentity(mspId, certPEM, keyPEM)

    const wallet = new FileSystemWallet('./wallet');
    await wallet.import(identityLabel, identity);

    if (await wallet.exists(identityLabel)) {
        logger.info('Identity %s exists.', identityLabel);
    }
    else {
        logger.error('Identity %s does not exist.', identityLabel);
    }
    return wallet;
}