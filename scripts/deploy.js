const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying DisputeResolution contract...");

  // Get the ContractFactory and Signers
  const DisputeResolution = await ethers.getContractFactory("DisputeResolution");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the contract
  const disputeResolution = await DisputeResolution.deploy();
  await disputeResolution.deployed();

  console.log("DisputeResolution deployed to:", disputeResolution.address);
  
  // Authorize the deployer as the first juror
  const authorizeTx = await disputeResolution.authorizeJuror(deployer.address);
  await authorizeTx.wait();
  
  console.log("Deployer authorized as juror:", deployer.address);

  // Save the deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: disputeResolution.address,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    network: "monad-testnet"
  };

  fs.writeFileSync(
    './deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployment-info.json");
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("Contract Address:", disputeResolution.address);
  console.log("Update DISPUTE_CONTRACT_ADDRESS in your frontend files with this address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
