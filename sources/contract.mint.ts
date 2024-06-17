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
    const MAINNET = process.env.MAINNET == "true";
    console.log('Mainnet: ', MAINNET);
    // Create client for mainnet/testnet wallet v4 API
    const client4 = new TonClient4({
        endpoint: MAINNET ? "https://mainnet-v4.tonhubapi.com" : "https://sandbox-v4.tonhubapi.com",
    });

    // Parameters for NFTs
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "ipfs://bafybeieohr6wlvpxz2aol3hdxbbjqflczpvxxb56ngtr4jwqcunnn4uzeu/collection.json";
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();
    const seed = MAINNET ? process.env.MNEMONIC_MAIN : process.env.MNEMONIC;

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
    let collection_client = client4.open(NftCollection.fromAddress(deployContract));
    console.log("Collection address: ", deployContract);

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
            token_owner: address("0QDSsrY85GlfPACvL4H-ILhtMTjnEVo-TUrM9NU7p0-afYt3"),
            //token_owner: address("UQCvr59O9r4t9qPX6HFM27KXOofEITApFRkhXGp07kMXQ5Ld")
            token_metadata: "ipfs://QmeKXHpNyQJHyVYai5vAjzDbvn2MnTsnpp3EfcS6Bc3g29/"
        }
    );
    console.log("Mint is finished.");

    // let item_address = await collection_client.getGetNftAddressByIndex(latest_indexId);
    // console.log("Minting NFT Item: ", item_address);
})();
