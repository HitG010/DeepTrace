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

//0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512