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
 const {Gateway, FileSystemWallet, X509WalletMixin} = require('fabric-network');
 
 var logger = new (winston.Logger)({transports: [new (winston.transports.Console)()]});
 
 // Call the only test function.
 test();
 //testTransaction();
 
 async function test() {
     const identityLabel = 'admin@org1';
     const wallet = await initAdminWallet(identityLabel);
     const gateway = new Gateway();
 
     await gateway.connect(path.join(__dirname, '../connections/mychannel_simplemsg_profile.json'),
         {
             wallet: wallet,
             identity: identityLabel
         });
 
     logger.info('Gateway connects get succeed in query testing.');
 
     const network = await gateway.getNetwork('mychannel');
     const contract = await network.getContract('simplemsg');
     const result = await contract.submitTransaction('createSimplemsg', 'M001', 'V_123');
     gateway.disconnect();
     
     logger.info('Result', Buffer.from(result).toString());
 }
 
 async function testTransaction() {
     const identityLabel = 'Admin_label@org1.example.com';
     const wallet = await initAdminWallet(identityLabel);
     const gateway = new Gateway();
 
     await gateway.connect(path.join(__dirname, './connprofile.json'),
         {
             wallet: wallet,
             identity: identityLabel,
             discovery: { enabled:false, asLocalhost: true }
         });
 
     logger.info('Gateway connects get succeed.');
 
     const network = await gateway.getNetwork('mychannel');
     const contract = await network.getContract('vehiclesharing');
     const result = await contract.submitTransaction("createVehicle", getRandomId(), "MST");
     gateway.disconnect();
     
     logger.info('Result', Buffer.from(result).toString());
 }
 
 function getRandomId() {
     return Math.random().toString().substring(2).substring(0,8);
 }
 
 async function initAdminWallet(identityLabel) {
     // Hardcode crypto materials of Admin@org1.example.com.
     const keyPath = path.join(__dirname, "../identities/admin@org1/private_key.pem");
     const keyPEM = Buffer.from(fs.readFileSync(keyPath)).toString();
     const certPath = path.join(__dirname, "../identities/admin@org1/certificate.pem");
     const certPEM = Buffer.from(fs.readFileSync(certPath)).toString();
 
     const mspId = 'org1';
     const identity = X509WalletMixin.createIdentity(mspId, certPEM, keyPEM)
 
     const wallet = new FileSystemWallet('./wallet');
     await wallet.import(identityLabel, identity);
 
     if (await wallet.exists(identityLabel)) {
         logger.info('Identity %s exists.', identityLabel);
     }
     else {
         logger.error('Identity %s does not exist.', identityLabel);
     }
 
     // Once the wallet is imported as above, we can use the wallet directly.
     // There are 3 files in the wallet: private key, public key, config file with cert.
     // The signingIdentity can be modified, it should be consistent with the priv/pub key file name.
     //const wallet = new FileSystemWallet('/tmp/wallet/test1');
     return wallet;
 }