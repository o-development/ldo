# LDO-CLI

A command line interface for Linked Data Objects. LDO-CLI builds `.shex` shapes into LDO types.

## Setup
Install the CLI

```bash
npm i @ldo/cli --save-dev
```

Set up a shapes folder
```bash
mkdir .shapes
```

Place ShexC shapes inside `.shex` files

```bash
touch ./.shapes/example.shex
```

Build the shpaes
```bash
ldo build --input ./.shapes --output ./.ldo
```

## Sponsorship
This project was made possible by a grant from NGI Zero Entrust via nlnet. Learn more on the [NLnet project page](https://nlnet.nl/project/SolidUsableApps/).

[<img src="https://nlnet.nl/logo/banner.png" alt="nlnet foundation logo" width="300" />](https://nlnet.nl/)
[<img src="https://nlnet.nl/image/logos/NGI0Entrust_tag.svg" alt="NGI Zero Entrust Logo" width="300" />](https://nlnet.nl/)

## Liscense
MIT