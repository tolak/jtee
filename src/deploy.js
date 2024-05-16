const fs = require('fs');
const path = require('path');
const { signAndSend, signCertificate, OnChainRegistry, options, PinkCodePromise } = require('@phala/sdk');
const { ApiPromise, Keyring, WsProvider } = require('@polkadot/api');
const BN = require('bn.js');

/**
 * Deploy smart contract to Phala network.
 */
async function deployContract(uri, endpoint) {
    const targetFile = path.join(__dirname, 'engine/jtee_engine.contract');
    if (!fs.existsSync(targetFile)) {
        return new Error(`${targetFile} not exists.`);
    }
    const contractFile = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));

    // Initialization
    console.log('Connecting to', endpoint, '...');
    const provider = new WsProvider(endpoint);
    const api = await ApiPromise.create(options({ provider, noInitWarn: true }));
    console.log('Connected.');

    const keyring = new Keyring({ type: 'sr25519' });
    const user = keyring.addFromUri(uri);
    const accountInfo = await api.query.system.account(user.address);
    const free = accountInfo.data.free.div(new BN(1e12)).toNumber();
    console.log(`Account ${user.address} has ${free} PHA.`);
    if (free < 20) {
        console.error('Not enough balance. Please transfer some tokens not less then 20 PHA to', user.address);
        return new Error('Insufficient Balance');
    }

    const phatRegistry = await OnChainRegistry.create(api);

    const clusterId = phatRegistry.clusterId;
    // const clusterInfo = phatRegistry.clusterInfo;
    const pruntimeURL = phatRegistry.pruntimeURL;
    console.log('Cluster ID:', clusterId);
    console.log('Pruntime Endpoint URL:', pruntimeURL);

    const balance = await phatRegistry.getClusterBalance(user.address);
    console.log('Cluster Balance:', balance.total.div(new BN(1e12)).toNumber());

    if (balance.free.div(new BN(1e12)).toNumber() < 500) {
        console.log('Transfer to cluster...');
        try {
            await signAndSend(phatRegistry.transferToCluster(user.address, 1e12 * 500), user);
        } catch (err) {
            console.log(`Transfer to cluster failed: ${err}`);
            console.error(err);
            return new Error('Transfer Error');
        }
    }

    const cert = await signCertificate({ pair: user });

    // All prepare conditions ready. Upload with PinkCodePromise
    console.log('Upload codes...');

    const codePromise = new PinkCodePromise(phatRegistry, contractFile, contractFile.source.wasm);
    const uploadResult = await signAndSend(codePromise.tx.default(), user);
    // await uploadResult.waitFinalized(user, cert);
    await uploadResult.waitFinalized();
    console.log('Code ready in cluster.');

    // Instantiate with PinkBlueprintPromise
    console.log('Instantiating...');
    const instantiateResult = await uploadResult.blueprint.send.default({ pair: user, cert, address: cert.address });
    await instantiateResult.waitFinalized();

    await api.disconnect();
    console.log('Disonnected.');

    const { contractId } = instantiateResult;
    console.log('✅ Contract uploaded & instantiated: ', contractId);

    return contractId;
}

module.exports = {
    deployContract,
}
