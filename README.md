# Collection of SBTs for Assister

This GitHub repository contains code to deploy collection of NFT in testnet/mainnet in TON.

## How to use

First create .env file
```bash
MNEMONIC = "apple1 apple2 ... apple24"
MNEMONIC_MAIN = "potato1 potato2 ... potato24"
MAINNET = false
```

Then run scripts:

```bash
yarn build # To build contract
yarn deploy # Testnet deployment
yarn deploy_mainnet # Mainent deployment
yarn read # The way to read the smart contract data after your deployed the code
```