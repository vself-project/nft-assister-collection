import { beginCell, contractAddress, toNano, Address } from "@ton/ton";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";
// ================================================================= //
import { NftCollection } from "./output/sample_NftCollection";
// ================================================================= //

(async () => {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    //const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/"; // Change to the content URL you prepared
    const string_first = "https://gateway.pinata.cloud/ipfs/QmUUN6c4Q7joJcU4XaX53QLrq8AWc9gJaQkxfm6X3KDuCj/"; // Change to the content URL you prepared
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();

    // ===== Parameters =====
    // Replace owner with your address
    let owner = Address.parse("EQDSsrY85GlfPACvL4H-ILhtMTjnEVo-TUrM9NU7p0-afW04"); // 🔴🔴🔴

    // Prepare the initial code and data for the contract
    let init = await NftCollection.init(owner, newContent, {
        $$type: "RoyaltyParams",
        numerator: 350n, // 350n = 35%
        denominator: 1000n,
        destination: owner,
    });

    let address = contractAddress(0, init);
    let deployAmount = toNano("0.15");
    let testnet = true;

    // The Transaction body we want to pass to the smart contract
    let body = beginCell().storeUint(0, 32).storeStringTail("Mint").endCell();

    // Do deploy
    await deploy(init, deployAmount, body, testnet);
    printHeader("sampleNFT_Contract");
    printAddress(address);
})();
