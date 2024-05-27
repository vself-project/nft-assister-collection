import { beginCell, contractAddress, toNano, Cell, Address, TonClient4 } from "@ton/ton";
import { deploy } from "./utils/deploy";
import { printAddress, printDeploy, printHeader } from "./utils/print";
// ================================================================= //
import { NftCollection } from "./output/sample_NftCollection";
// ================================================================= //

(async () => {
    const client = new TonClient4({
        endpoint: "https://mainnet-v4.tonhubapi.com", // 🔴 Main-net API endpoint
        //endpoint: "https://sandbox-v4.tonhubapi.com", // 🔴 Test-net API endpoint
    });

    // Parameters
    const collection_address = Address.parse("EQDZv2Glu_Gmq30lQ9dCXHQN7Ht5NhGkvTJ0DrRvSXmx2kh0"); // https://getgems.io/collection/EQDZv2Glu_Gmq30lQ9dCXHQN7Ht5NhGkvTJ0DrRvSXmx2kh0
    const collection_contract = await NftCollection.fromAddress(collection_address);
    let client_open = client.open(collection_contract);

    const nft_index = 1n;
    let address_by_index = await client_open.getGetNftAddressByIndex(nft_index);
    printHeader("sampleNFT_Contract");
    //printAddress(collection_address);
    // printHeader("1234");
    console.log("NFT ID[" + nft_index + "]: " + address_by_index);
    console.log(`NFT Explorer: https://explorer.tonnft.tools/nft/${address_by_index}`);
})();
