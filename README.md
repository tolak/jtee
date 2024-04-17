# jtee - Run JavaScript on Phala TEE cloud.

<img src="./static/imgs/hello-jtee" alt="drawing" width="400"/>

## Usage

- Create a new jtee project

```bash
$ jtee new  <my-jtee-project>
```

- Run the project on Phala TEE cloud

```bash
$ jtee run <script string or file path>
```

- Upload the project to Phala TEE cloud

```bash
$ jtee upload
```

See more usage, execute `jtee --help`.

## Build jtee

```bash
$ yarn build
```

Binary file will be created in `dist/jtee`.

## Build jtee engine

```bash
$ cd engine & cargo build --release
```
