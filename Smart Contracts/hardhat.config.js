require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 12227332,
    },
  },
  paths: {
    artifacts: "../src/artifacts",
  }
};
