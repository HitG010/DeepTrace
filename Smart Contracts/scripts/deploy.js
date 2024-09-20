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

//0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0