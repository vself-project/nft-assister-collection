import {
    Address,
    beginCell,
    contractAddress,
    toNano,
    TonClient4,
    internal,
    fromNano,
    WalletContractV4,
    address,
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
    // Create client for mainnet/testnet wallet v4 API
    const client4 = new TonClient4({
        endpoint: process.env.MAINNET ? "https://mainnet-v4.tonhubapi.com" : "https://sandbox-v4.tonhubapi.com",
    });

    // Parameters for NFTs
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    //const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/"; // Change to the content URL you prepared
    //const string_first = "https://gateway.pinata.cloud/ipfs/QmUUN6c4Q7joJcU4XaX53QLrq8AWc9gJaQkxfm6X3KDuCj/";
    //const string_first = "https://gateway.pinata.cloud/ipfs/bafybeiaqhcw4r33jqdws7kish36s5o4lkpsxyfbm6npjxemfvn4xwpxh6q/";
    //const string_first = "https://gateway.pinata.cloud/ipfs/QmNkPuWdMk8DYQxZWQLNZ3n7qRsbrcEPidqjATvJngd91a/";
    //const string_first = "https://gateway.pinata.cloud/ipfs/QmXut6m7XsyQWVH1A9wY78NFhwHKfEiuqCXej3TRUu432C/";
    const string_first = "ipfs://QmXut6m7XsyQWVH1A9wY78NFhwHKfEiuqCXej3TRUu432C/";
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();
    const seed = process.env.MAINNET ? process.env.MNEMONIC_MAIN : process.env.MNEMONIC;

    let mnemonics = (seed || "").toString();
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
    //let packed = beginCell().storeUint(1, 32).storeStringTail("Mint").endCell();
    // ========================================
    // let deployAmount = toNano("0.3");
    // let seqno: number = await wallet_contract.getSeqno();
    // let balance: bigint = await wallet_contract.getBalance();
    // ========================================
    // console.log("Current deployment wallet balance: ", fromNano(balance).toString(), "💎TON");
    // printSeparator();
    // console.log("Deploying contract to address: ", deployContract);
    // await wallet_contract.sendTransfer({
    //     seqno,
    //     secretKey,
    //     messages: [
    //         internal({
    //             to: deployContract,
    //             value: deployAmount,
    //             bounce: true,
    //             body: packed,
    //         }),
    //     ],
    // });

    let collection_client = client4.open(NftCollection.fromAddress(deployContract));

    let latest_indexId = (await collection_client.getGetCollectionData()).next_item_index;
    console.log("Latest indexID:[", latest_indexId, "]");

    const mintAmount = toNano("0.1");
    let mint_res = await collection_client.send(
        wallet_contract.sender(secretKey),
        {
            value: mintAmount
        },
        {
            $$type: "Mint",
            token_owner: address("0QDSsrY85GlfPACvL4H-ILhtMTjnEVo-TUrM9NU7p0-afYt3")
            //token_owner: address("UQCvr59O9r4t9qPX6HFM27KXOofEITApFRkhXGp07kMXQ5Ld")

        }
    );
    console.log("Mint result: ", mint_res);

    // let item_address = await collection_client.getGetNftAddressByIndex(latest_indexId);
    // console.log("Minting NFT Item: ", item_address);
})();
