const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("FrontendRegistry", function () {
  async function deployFrontendRegistryFixture() {
    const [owner, user1, user2] = await ethers.getSigners();
    const FrontendRegistry = await ethers.getContractFactory("FrontendRegistry");
    const frontendRegistry = await FrontendRegistry.deploy();
    await frontendRegistry.deployed();
    return { frontendRegistry, owner, user1, user2 };
  }

  const testHash1 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-content-hash-1"));
  const testHash2 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-content-hash-2"));
  const testHash3 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test-content-hash-3"));
  const version1 = "v1.0.0";
  const version2 = "v1.1.0";
  const version3 = "v2.0.0";
  const description1 = "Initial release";
  const description2 = "Bug fixes";
  const description3 = "Major update";

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      expect(await frontendRegistry.owner()).to.equal(owner.address);
    });

    it("Should deploy successfully", async function () {
      const { frontendRegistry } = await loadFixture(deployFrontendRegistryFixture);
      expect(frontendRegistry.address).to.be.properAddress;
    });
  });

  describe("Register Frontend", function () {
    it("Should register a new frontend version successfully", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      const tx = await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(frontendRegistry, "FrontendRegistered")
        .withArgs(testHash1, version1, block.timestamp, description1);
      
      const [isValid, isActive, versionStr] = await frontendRegistry.verifyFrontend(testHash1);
      expect(isValid).to.be.true;
      expect(isActive).to.be.true;
      expect(versionStr).to.equal(version1);
    });

    it("Should revert when non-owner tries to register", async function () {
      const { frontendRegistry, user1 } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.connect(user1).registerFrontend(testHash1, version1, description1))
        .to.be.revertedWith("Unauthorized");
    });

    it("Should revert when registering with zero hash", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.connect(owner).registerFrontend(ethers.constants.HashZero, version1, description1))
        .to.be.revertedWith("InvalidHash");
    });

    it("Should revert when registering with empty version", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.connect(owner).registerFrontend(testHash1, "", description1))
        .to.be.revertedWith("InvalidVersion");
    });

    it("Should revert when registering duplicate hash", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      await expect(frontendRegistry.connect(owner).registerFrontend(testHash1, version2, description2))
        .to.be.revertedWith("HashAlreadyRegistered");
    });

    it("Should register multiple different versions", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      await frontendRegistry.connect(owner).registerFrontend(testHash3, version3, description3);
      
      const totalVersions = await frontendRegistry.getTotalVersions();
      expect(totalVersions).to.equal(3);
    });

    it("Should set newly registered version as current", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      const currentVersion = await frontendRegistry.getCurrentVersion();
      expect(currentVersion.contentHash).to.equal(testHash1);
      expect(currentVersion.version).to.equal(version1);
      expect(currentVersion.isActive).to.be.true;
    });
  });

  describe("Deprecate Frontend", function () {
    it("Should deprecate a frontend version successfully", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      const tx = await frontendRegistry.connect(owner).deprecateFrontend(testHash1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(frontendRegistry, "FrontendDeprecated")
        .withArgs(testHash1, version1, block.timestamp);
      
      const [isValid, isActive, versionStr] = await frontendRegistry.verifyFrontend(testHash1);
      expect(isValid).to.be.true;
      expect(isActive).to.be.false;
    });

    it("Should revert when non-owner tries to deprecate", async function () {
      const { frontendRegistry, owner, user1 } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      await expect(frontendRegistry.connect(user1).deprecateFrontend(testHash1))
        .to.be.revertedWith("Unauthorized");
    });

    it("Should revert when deprecating non-existent hash", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.connect(owner).deprecateFrontend(testHash1))
        .to.be.revertedWith("HashNotRegistered");
    });

    it("Should revert when deprecating already deprecated version", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).deprecateFrontend(testHash1);
      
      await expect(frontendRegistry.connect(owner).deprecateFrontend(testHash1))
        .to.be.revertedWith("VersionNotActive");
    });
  });

  describe("Reactivate Frontend", function () {
    it("Should reactivate a deprecated frontend version", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).deprecateFrontend(testHash1);
      
      const tx = await frontendRegistry.connect(owner).reactivateFrontend(testHash1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(frontendRegistry, "FrontendReactivated")
        .withArgs(testHash1, version1, block.timestamp);
      
      const [isValid, isActive, versionStr] = await frontendRegistry.verifyFrontend(testHash1);
      expect(isActive).to.be.true;
    });

    it("Should revert when non-owner tries to reactivate", async function () {
      const { frontendRegistry, owner, user1 } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).deprecateFrontend(testHash1);
      
      await expect(frontendRegistry.connect(user1).reactivateFrontend(testHash1))
        .to.be.revertedWith("Unauthorized");
    });

    it("Should revert when reactivating non-existent hash", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.connect(owner).reactivateFrontend(testHash1))
        .to.be.revertedWith("HashNotRegistered");
    });

    it("Should revert when reactivating already active version", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      await expect(frontendRegistry.connect(owner).reactivateFrontend(testHash1))
        .to.be.revertedWith("Version already active");
    });
  });

  describe("Set Current Version", function () {
    it("Should set current version successfully", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      
      const tx = await frontendRegistry.connect(owner).setCurrentVersion(testHash1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(frontendRegistry, "CurrentVersionUpdated")
        .withArgs(testHash2, testHash1, block.timestamp);
      
      const currentVersion = await frontendRegistry.getCurrentVersion();
      expect(currentVersion.contentHash).to.equal(testHash1);
    });

    it("Should revert when setting non-existent version as current", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.connect(owner).setCurrentVersion(testHash1))
        .to.be.revertedWith("HashNotRegistered");
    });

    it("Should revert when setting deprecated version as current", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).deprecateFrontend(testHash1);
      
      await expect(frontendRegistry.connect(owner).setCurrentVersion(testHash1))
        .to.be.revertedWith("VersionNotActive");
    });

    it("Should revert when non-owner tries to set current version", async function () {
      const { frontendRegistry, owner, user1 } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      await expect(frontendRegistry.connect(user1).setCurrentVersion(testHash1))
        .to.be.revertedWith("Unauthorized");
    });
  });

  describe("Verify Frontend", function () {
    it("Should verify registered and active frontend", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      const [isValid, isActive, versionStr] = await frontendRegistry.verifyFrontend(testHash1);
      expect(isValid).to.be.true;
      expect(isActive).to.be.true;
      expect(versionStr).to.equal(version1);
    });

    it("Should return false for non-registered hash", async function () {
      const { frontendRegistry } = await loadFixture(deployFrontendRegistryFixture);
      
      const [isValid, isActive, versionStr] = await frontendRegistry.verifyFrontend(testHash1);
      expect(isValid).to.be.false;
      expect(isActive).to.be.false;
      expect(versionStr).to.equal("");
    });

    it("Should show deprecated status for deprecated version", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).deprecateFrontend(testHash1);
      
      const [isValid, isActive, versionStr] = await frontendRegistry.verifyFrontend(testHash1);
      expect(isValid).to.be.true;
      expect(isActive).to.be.false;
      expect(versionStr).to.equal(version1);
    });
  });

  describe("View Functions", function () {
    it("Should get version details correctly", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      const versionData = await frontendRegistry.getVersion(testHash1);
      expect(versionData.version).to.equal(version1);
      expect(versionData.isActive).to.be.true;
      expect(versionData.description).to.equal(description1);
      expect(versionData.timestamp).to.be.gt(0);
    });

    it("Should revert when getting non-existent version", async function () {
      const { frontendRegistry } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.getVersion(testHash1))
        .to.be.revertedWith("HashNotRegistered");
    });

    it("Should get version by index correctly", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      
      const versionData = await frontendRegistry.getVersionByIndex(0);
      expect(versionData.contentHash).to.equal(testHash1);
      expect(versionData.version).to.equal(version1);
    });

    it("Should revert when getting version with invalid index", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      await expect(frontendRegistry.getVersionByIndex(5))
        .to.be.revertedWith("Index out of bounds");
    });

    it("Should get all versions correctly", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      await frontendRegistry.connect(owner).registerFrontend(testHash3, version3, description3);
      
      const allVersions = await frontendRegistry.getAllVersions();
      expect(allVersions.length).to.equal(3);
      expect(allVersions[0].version).to.equal(version1);
      expect(allVersions[1].version).to.equal(version2);
      expect(allVersions[2].version).to.equal(version3);
    });

    it("Should get only active versions", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      await frontendRegistry.connect(owner).registerFrontend(testHash3, version3, description3);
      await frontendRegistry.connect(owner).deprecateFrontend(testHash2);
      
      const activeVersions = await frontendRegistry.getActiveVersions();
      expect(activeVersions.length).to.equal(2);
      expect(activeVersions[0].version).to.equal(version1);
      expect(activeVersions[1].version).to.equal(version3);
    });

    it("Should return correct total versions count", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      
      const totalVersions = await frontendRegistry.getTotalVersions();
      expect(totalVersions).to.equal(2);
    });

    it("Should check if hash is registered", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      const isRegistered = await frontendRegistry.isHashRegistered(testHash1);
      const isNotRegistered = await frontendRegistry.isHashRegistered(testHash2);
      
      expect(isRegistered).to.be.true;
      expect(isNotRegistered).to.be.false;
    });

    it("Should check if hash is current version", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      
      const isCurrent1 = await frontendRegistry.isCurrentVersion(testHash1);
      const isCurrent2 = await frontendRegistry.isCurrentVersion(testHash2);
      
      expect(isCurrent1).to.be.false;
      expect(isCurrent2).to.be.true;
    });

    it("Should return false for current version when no versions exist", async function () {
      const { frontendRegistry } = await loadFixture(deployFrontendRegistryFixture);
      
      const isCurrent = await frontendRegistry.isCurrentVersion(testHash1);
      expect(isCurrent).to.be.false;
    });

    it("Should revert when getting current version with no versions registered", async function () {
      const { frontendRegistry } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.getCurrentVersion())
        .to.be.revertedWith("NoVersionsRegistered");
    });
  });

  describe("Ownership Transfer", function () {
    it("Should initiate ownership transfer", async function () {
      const { frontendRegistry, owner, user1 } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.connect(owner).initiateOwnershipTransfer(user1.address))
        .to.emit(frontendRegistry, "OwnershipTransferInitiated")
        .withArgs(owner.address, user1.address);
      
      expect(await frontendRegistry.pendingOwner()).to.equal(user1.address);
      expect(await frontendRegistry.owner()).to.equal(owner.address);
    });

    it("Should complete ownership transfer", async function () {
      const { frontendRegistry, owner, user1 } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).initiateOwnershipTransfer(user1.address);
      
      await expect(frontendRegistry.connect(user1).acceptOwnership())
        .to.emit(frontendRegistry, "OwnershipTransferred")
        .withArgs(owner.address, user1.address);
      
      expect(await frontendRegistry.owner()).to.equal(user1.address);
      expect(await frontendRegistry.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("Should revert when non-owner tries to initiate transfer", async function () {
      const { frontendRegistry, user1, user2 } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.connect(user1).initiateOwnershipTransfer(user2.address))
        .to.be.revertedWith("Unauthorized");
    });

    it("Should revert when initiating transfer to zero address", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await expect(frontendRegistry.connect(owner).initiateOwnershipTransfer(ethers.constants.AddressZero))
        .to.be.revertedWith("InvalidAddress");
    });

    it("Should revert when non-pending owner tries to accept", async function () {
      const { frontendRegistry, owner, user1, user2 } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).initiateOwnershipTransfer(user1.address);
      
      await expect(frontendRegistry.connect(user2).acceptOwnership())
        .to.be.revertedWith("Unauthorized");
    });

    it("Should allow owner to cancel ownership transfer", async function () {
      const { frontendRegistry, owner, user1 } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).initiateOwnershipTransfer(user1.address);
      await frontendRegistry.connect(owner).cancelOwnershipTransfer();
      
      expect(await frontendRegistry.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });

    it("Should revert when non-owner tries to cancel transfer", async function () {
      const { frontendRegistry, owner, user1 } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).initiateOwnershipTransfer(user1.address);
      
      await expect(frontendRegistry.connect(user1).cancelOwnershipTransfer())
        .to.be.revertedWith("Unauthorized");
    });

    it("Should allow new owner to perform owner functions after transfer", async function () {
      const { frontendRegistry, owner, user1 } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).initiateOwnershipTransfer(user1.address);
      await frontendRegistry.connect(user1).acceptOwnership();
      
      await expect(frontendRegistry.connect(user1).registerFrontend(testHash1, version1, description1))
        .to.emit(frontendRegistry, "FrontendRegistered");
      
      await expect(frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2))
        .to.be.revertedWith("Unauthorized");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete version lifecycle", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      
      let [isValid, isActive, versionStr] = await frontendRegistry.verifyFrontend(testHash1);
      expect(isValid).to.be.true;
      expect(isActive).to.be.true;
      
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      
      let currentVersion = await frontendRegistry.getCurrentVersion();
      expect(currentVersion.contentHash).to.equal(testHash2);
      
      await frontendRegistry.connect(owner).deprecateFrontend(testHash1);
      
      [isValid, isActive, versionStr] = await frontendRegistry.verifyFrontend(testHash1);
      expect(isValid).to.be.true;
      expect(isActive).to.be.false;
      
      await frontendRegistry.connect(owner).reactivateFrontend(testHash1);
      await frontendRegistry.connect(owner).setCurrentVersion(testHash1);
      
      currentVersion = await frontendRegistry.getCurrentVersion();
      expect(currentVersion.contentHash).to.equal(testHash1);
      expect(currentVersion.isActive).to.be.true;
    });

    it("Should maintain correct state across multiple operations", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      await frontendRegistry.connect(owner).registerFrontend(testHash3, version3, description3);
      
      expect(await frontendRegistry.getTotalVersions()).to.equal(3);
      
      await frontendRegistry.connect(owner).deprecateFrontend(testHash1);
      await frontendRegistry.connect(owner).deprecateFrontend(testHash2);
      
      const activeVersions = await frontendRegistry.getActiveVersions();
      expect(activeVersions.length).to.equal(1);
      expect(activeVersions[0].contentHash).to.equal(testHash3);
      
      const allVersions = await frontendRegistry.getAllVersions();
      expect(allVersions.length).to.equal(3);
    });

    it("Should handle version switching correctly", async function () {
      const { frontendRegistry, owner } = await loadFixture(deployFrontendRegistryFixture);
      
      await frontendRegistry.connect(owner).registerFrontend(testHash1, version1, description1);
      await frontendRegistry.connect(owner).registerFrontend(testHash2, version2, description2);
      await frontendRegistry.connect(owner).registerFrontend(testHash3, version3, description3);
      
      expect(await frontendRegistry.isCurrentVersion(testHash3)).to.be.true;
      
      await frontendRegistry.connect(owner).setCurrentVersion(testHash2);
      expect(await frontendRegistry.isCurrentVersion(testHash2)).to.be.true;
      expect(await frontendRegistry.isCurrentVersion(testHash3)).to.be.false;
      
      await frontendRegistry.connect(owner).setCurrentVersion(testHash1);
      expect(await frontendRegistry.isCurrentVersion(testHash1)).to.be.true;
      expect(await frontendRegistry.isCurrentVersion(testHash2)).to.be.false;
    });
  });
});
