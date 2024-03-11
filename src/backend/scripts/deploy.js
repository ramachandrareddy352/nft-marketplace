const { ethers, network } = require("hardhat")

async function main() {

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // deploy contracts here:
    const MARKETPLACE = await ethers.getContractFactory("marketplace");
    const marketplace = await MARKETPLACE.deploy(1);

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();

    const networkName = network.name;
    console.log(networkName);
    // For each contract, pass the deployed contract and name to this function to save a copy of the contract  ABI and address to the front end.
    saveFrontendFiles(marketplace, networkName, "marketplace");
    saveFrontendFiles(nft, networkName, "nft");
}

function saveFrontendFiles(contract, name, data) {
    const fs = require("fs");
    const contractsDir = __dirname + "/../../frontend/contractsData";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + `/${data}-${name}-address.json`,
        JSON.stringify({ address: contract.address }, undefined, 2)
    );
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });