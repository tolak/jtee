async function main() {
    // The account public key in Phala network you used to deploy the engine
    console.log('executor owner:', jtee.owner);

    // The account derived inside TEE for your project which you can use to
    // submit transaction to Ethereum
    console.log('executor account:', jtee.account);
 
    // ! NEVER print the key to log
    // The private key of jtee account above, never revealed to outside
    const key = jtee.key;

    // Now you can create transaction data and sign it with `key`,
    // Make sure have ETH in the executor account before send tx to blockchain
    // For example, call method Flipper.flip() of solidity contract `contract/Flipper.sol`
    /*
    const abi = [
        "function flip() public",
    ];
    const wallet = new ethers.Wallet(key, new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC | 'http://127.0.0.1:8488'));
    const flipper = new ethers.Contract('0x...', abi, wallet);
    await flipper.flip();
    */
}

main().catch(console.error);
