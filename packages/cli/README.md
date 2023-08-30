# LDO-CLI

A command line interface for Linked Data Objects. LDO-CLI builds `.shex` shapes into LDO types.

## Setup
Install the CLI

```bash
npm i ldo-cli --save-dev
```

Set up a shapes folder
```bash
mkdir shapes
```

Place ShexC shapes inside `.shex` files

```bash
touch ./shapes/example.shex
```

Build the shpaes
```bash
ldo build --input ./shapes --output ./ldo
```