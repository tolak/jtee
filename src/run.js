const fs = require('fs');
const { Keyring } = require('@polkadot/api');
const { getClient, estimateContract, KeyringPairProvider } = require('@phala/sdk');
const BN = require('bn.js');


/**
 * Run Javascript code with engine contract.
 */
async function runScript(uri, endpoint, contractId, script) {
    const targetFile = 'src/engine/jtee_engine.json'
    if (!fs.existsSync(targetFile)) {
        return new Error(`${targetFile} not exists.`);
    }
    const abi = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));

    const client = await getClient({ transport: endpoint });
    const contractKey = await client.getContractKeyOrFail(contractId);
    const provider = await KeyringPairProvider.createFromSURI(client.api, uri);

    const keyring = new Keyring({ type: 'sr25519' });
    const user = keyring.addFromUri(uri);
    const accountInfo = await client.api.query.system.account(user.address);
    const free = accountInfo.data.free.div(new BN(1e12)).toNumber();
    console.log(`Account ${user.address} has ${free} PHA.`);
    if (free < 20) {
        console.error('Not enough balance. Please transfer some tokens not less then 20 PHA to', user.address);
        return new Error('Insufficient Balance');
    }

    const { request } = await estimateContract(client, {
        address: contractId,
        contractKey,
        abi,
        provider,
        functionName: 'runJs',
        args: ['SidevmQuickJS', script, []],
    });

    const executionResult = await sendPinkCommand(client, request);

    await api.disconnect();
    console.log('Disonnected.');

    return executionResult;
}

module.exports = {
    runScript,
}
