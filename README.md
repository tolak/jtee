# jtee - Run JavaScript on Phala TEE cloud.

<img src="./static/imgs/hello-jtee" alt="drawing" width="400"/>

## Usage

- Create a new jtee project

```bash
$ jtee new  <my-jtee-project>
```

- Deploy the engine

In order to run Javascript on Phala TEE cloud, you need to deploy an Javascript engine first.
The purpose of this engine is 1) execute the JavaScript code and 2) inject a Javascript `jtee` object
that you can use in your script.

Before run deploy command, you need to prepare a Phala blockchain account with enough balance and the node endpoint
in the .env file like below in your project root directory.

```bash
PHALA_ACCOUNT_URI="elegant capable test bar uncover comic speed cabin tattoo company cabin layer"
PHALA_RPC=wss://poc6.phala.network/ws
```

Then, execute the following command to deploy the engine:

```bash
$ jtee deploy
```

You finally will get the contract ID if everything went well

```bash
✅ Contract uploaded & instantiated:  0x9caa44c6686d1c1e17b4885a96faa6d055055930a248531950b0c11217cebf51
```

- Run the project on Phala TEE cloud

By issuing following command, run the code located in `app/index.js` on Phala TEE could:

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

Binary file will be created in `dist/jtee`.

## Build jtee engine (Rust toolchain needed)

```bash
$ cd engine & cargo build --release
```
