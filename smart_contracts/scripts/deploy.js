const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", hre.ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // Deploy VaultRegistry
  console.log("Deploying VaultRegistry...");
  const VaultRegistry = await hre.ethers.getContractFactory("VaultRegistry");
  const vaultRegistry = await VaultRegistry.deploy();
  await vaultRegistry.deployed();
  console.log("VaultRegistry deployed to:", vaultRegistry.address);

  // Deploy FrontendRegistry
  console.log("\nDeploying FrontendRegistry...");
  const FrontendRegistry = await hre.ethers.getContractFactory("FrontendRegistry");
  const frontendRegistry = await FrontendRegistry.deploy();
  await frontendRegistry.deployed();
  console.log("FrontendRegistry deployed to:", frontendRegistry.address);

  // Register initial frontend version
  console.log("\nRegistering initial frontend version...");
  const contentString = "VaultLink-v1.0.0-production";
  const contentHash = hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes(contentString));
  const version = "v1.0.0";
  const description = "Initial production release";
  
  console.log("Content Hash:", contentHash);
  console.log("Version:", version);
  
  const registerTx = await frontendRegistry.registerFrontend(contentHash, version, description);
  console.log("Registration transaction hash:", registerTx.hash);
  await registerTx.wait();
  console.log("Initial version registered successfully!");

  // Verify registration
  console.log("\nVerifying registration...");
  const verifyResult = await frontendRegistry.verifyFrontend(contentHash);
  console.log("Is Valid:", verifyResult.isValid);
  console.log("Is Active:", verifyResult.isActive);
  console.log("Version:", verifyResult.version);

  console.log("\n=== Deployment Summary ===");
  console.log("VaultRegistry:", vaultRegistry.address);
  console.log("FrontendRegistry:", frontendRegistry.address);
  console.log("Frontend Hash:", contentHash);
  console.log("Deployer:", deployer.address);
  console.log("Network:", hre.network.name);

  // Save deployment addresses to file
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      VaultRegistry: vaultRegistry.address,
      FrontendRegistry: frontendRegistry.address
    },
    frontendHash: contentHash,
    frontendVersion: version,
    timestamp: new Date().toISOString()
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\nDeployment info saved to ${deploymentsDir}/${hre.network.name}.json`);

  // Wait for block confirmations on live networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await vaultRegistry.deployTransaction.wait(6);
    await frontendRegistry.deployTransaction.wait(6);
    console.log("Block confirmations completed");

    // Verify contracts on Etherscan
    console.log("\nVerifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: vaultRegistry.address,
        constructorArguments: [],
      });
      console.log("VaultRegistry verified");
    } catch (error) {
      console.log("VaultRegistry verification error:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: frontendRegistry.address,
        constructorArguments: [],
      });
      console.log("FrontendRegistry verified");
    } catch (error) {
      console.log("FrontendRegistry verification error:", error.message);
    }
  }

  console.log("\n=== Deployment Complete ===\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
