import {
    Address,
    beginCell,
    contractAddress,
    toNano,
    TonClient4,
    internal,
    fromNano,
    WalletContractV4,
} from "@ton/ton";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader, printSeparator } from "./utils/print";
import { mnemonicToPrivateKey } from "@ton/crypto";
import * as dotenv from "dotenv";
dotenv.config();
// ================================================================= //
import { NftCollection } from "./output/sample_NftCollection";
import { NftItem } from "./output/sample_NftItem";
// ================================================================= //

(async () => {
    const MAINNET = process.env.MAINNET == "true";
    console.log('Mainnet: ', MAINNET);
    // Create client for TON API
    const client4 = new TonClient4({
        endpoint: MAINNET ? "https://mainnet-v4.tonhubapi.com" : "https://sandbox-v4.tonhubapi.com",
    });

    // Parameters for NFTs
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "ipfs://bafybeieohr6wlvpxz2aol3hdxbbjqflczpvxxb56ngtr4jwqcunnn4uzeu/collection.json";
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();
    const seed = MAINNET ? process.env.MNEMONIC_MAIN : process.env.MNEMONIC;
    let mnemonics = (seed || "").toString(); // 🔴 Change to your own, by creating .env file!
    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
    let secretKey = keyPair.secretKey;
    let workchain = 0;
    let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
    let wallet_contract = client4.open(wallet);
    console.log("Wallet address: ", wallet_contract.address);

    // Replace owner with your address
    let owner = wallet.address;

    // Prepare the initial code and data for the contract
    let init = await NftCollection.init(owner, newContent, {
        $$type: "RoyaltyParams",
        numerator: 350n, // 350n = 35%
        denominator: 1000n,
        destination: owner,
    });
    let deployContract = contractAddress(0, init);
    // ========================================
    let deployAmount = toNano("0.3");
    let seqno: number = await wallet_contract.getSeqno();
    let balance: bigint = await wallet_contract.getBalance();
    // ========================================
    console.log("Current deployment wallet balance: ", fromNano(balance).toString(), "💎TON");
    printSeparator();
    console.log("Deploying contract to address: ", deployContract);
    await wallet_contract.sendTransfer({
        seqno,
        secretKey,
        messages: [
            internal({
                to: deployContract,
                value: deployAmount,
                init: { code: init.code, data: init.data },
                bounce: true,
            }),
        ],
    });

    // let collection_client = client4.open(NftCollection.fromAddress(deployContract));
    // let latest_indexId = (await collection_client.getGetCollectionData()).next_item_index;
    // console.log("Latest indexID:[", latest_indexId, "]");
    // let item_address = await collection_client.getGetNftAddressByIndex(latest_indexId);
    // console.log("Minting NFT Item: ", item_address);
})();
