const hre = require("hardhat");

async function main() {
  
  const upload = await hre.ethers.deployContract("VideoStorage");
  await upload.waitForDeployment();

  console.log("Library deployed to:", upload.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//0x5FbDB2315678afecb367f032d93F642f64180aa3