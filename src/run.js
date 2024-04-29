const fs = require('fs');
const { Keyring } = require('@polkadot/api');
const { getClient, sendPinkQuery, KeyringPairProvider } = require('@phala/sdk');
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

    const keyring = new Keyring({ type: 'sr25519' });
    const client = await getClient({ transport: endpoint });
    const provider = await KeyringPairProvider.create(client.api, keyring.addFromUri(uri));
    const balance = await client.getClusterBalance(provider.address);
    console.log(`Account ${provider.address} balance: ${JSON.stringify(balance, null, 2)}`);

    const executionResult = await sendPinkQuery(client, {
        address: contractId,
        provider,
        abi,
        functionName: 'runJs',
        args: ['SidevmQuickJS', script, []],
    });

    await client.api.disconnect();
    console.log('Disonnected.');

    return executionResult;
}

module.exports = {
    runScript,
}
