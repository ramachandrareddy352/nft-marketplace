require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.18",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    goerli: {
      url: "https://goerli.infura.io/v3/99d56b536776435c82cdc37818d2fd29",
      accounts: ["c5cefd908982f33932c7afe8bd9aed3a5029cb65d49fbdb77aa0acb1c6edd9ab"]
    },
    ethereum: {
      url: "https://mainnet.infura.io/v3/99d56b536776435c82cdc37818d2fd29",
      accounts: ["c5cefd908982f33932c7afe8bd9aed3a5029cb65d49fbdb77aa0acb1c6edd9ab"]
    },
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/PTOnKnH8bCuEbcsN-RxlGpt24vlpxKQ1",
      accounts: ["c5cefd908982f33932c7afe8bd9aed3a5029cb65d49fbdb77aa0acb1c6edd9ab"]
    },
    polygon: {
      url: "https://polygon-mainnet.infura.io/v3/99d56b536776435c82cdc37818d2fd29",
      accounts: ["c5cefd908982f33932c7afe8bd9aed3a5029cb65d49fbdb77aa0acb1c6edd9ab"]
    },
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/kuDV_VXU2b-3YYwadBUAN2ydLgQEtDnt",
      accounts: ["c5cefd908982f33932c7afe8bd9aed3a5029cb65d49fbdb77aa0acb1c6edd9ab"]
    },
  }
};