# jtee - Run JavaScript on Phala TEE cloud.

<img src="./static/imgs/hello-jtee" alt="drawing" width="400"/>

## Usage

- Create a new jtee project

```bash
$ jtee new <my-jtee-project>
```

- Deploy the engine

To run Javascript on the Phala TEE cloud, you need to deploy a Javascript engine first.
The purpose of this engine is to 1) execute the JavaScript code and 2) inject a Javascript `jtee` object
that you can use in your script.

Before running the deploy command, you need to prepare a Phala blockchain account with enough balance and the node endpoint
in the .env file like below in your project root directory.

```bash
PHALA_ACCOUNT_URI="elegant capable test bar uncover comic speed cabin tattoo company cabin layer"
# PoC6 Testnet
PHALA_RPC=wss://poc6.phala.network/ws
```

Then, execute the following command to deploy the engine:

```bash
$ jtee deploy
```

You finally will get the contract ID if everything goes well

```bash
✅ Contract uploaded & instantiated: 0x9caa44c6686d1c1e17b4885a96faa6d055055930a248531950b0c11217cebf51
```

- Run the project on the Phala TEE cloud

By issuing the following command, run the code located in `app/index.js` on Phala TEE could:

```bash
$ jtee run
```

Or just run a specific piece of Javascript code:

```bash
$ jtee run "console.log(\"hello world\")"
```

See more usage, execute `jtee --help`.

## Build jtee from source code

```bash
$ yarn build
```

A binary file will be created in `dist/jtee`.

## Build the engine (Rust toolchain needed)

```bash
$ cd engine & cargo build --release
```
