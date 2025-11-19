const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("VaultRegistry", function () {
  async function deployVaultRegistryFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const VaultRegistry = await ethers.getContractFactory("VaultRegistry");
    const vaultRegistry = await VaultRegistry.deploy();
    await vaultRegistry.deployed();
    return { vaultRegistry, owner, user1, user2, user3 };
  }

  const testCID1 = "QmTest1Hash123456789";
  const testCID2 = "QmTest2Hash987654321";
  const testCID3 = "QmTest3HashABCDEFGHI";

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { vaultRegistry } = await loadFixture(deployVaultRegistryFixture);
      expect(vaultRegistry.address).to.be.properAddress;
    });
  });

  describe("Register Vault", function () {
    it("Should register a new vault successfully", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      const tx = await vaultRegistry.connect(user1).registerVault(testCID1);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(vaultRegistry, "VaultRegistered")
        .withArgs(user1.address, testCID1, block.timestamp);
      
      const vault = await vaultRegistry.getVault(user1.address);
      expect(vault.currentCID).to.equal(testCID1);
      expect(vault.exists).to.be.true;
    });

    it("Should revert when registering vault with empty CID", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await expect(vaultRegistry.connect(user1).registerVault(""))
        .to.be.revertedWith("EmptyCID");
    });

    it("Should revert when registering vault twice", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      await expect(vaultRegistry.connect(user1).registerVault(testCID2))
        .to.be.revertedWith("VaultAlreadyExists");
    });

    it("Should allow multiple users to register vaults", async function () {
      const { vaultRegistry, user1, user2, user3 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      await vaultRegistry.connect(user2).registerVault(testCID2);
      await vaultRegistry.connect(user3).registerVault(testCID3);
      
      const vault1 = await vaultRegistry.getVault(user1.address);
      const vault2 = await vaultRegistry.getVault(user2.address);
      const vault3 = await vaultRegistry.getVault(user3.address);
      
      expect(vault1.currentCID).to.equal(testCID1);
      expect(vault2.currentCID).to.equal(testCID2);
      expect(vault3.currentCID).to.equal(testCID3);
    });
  });

  describe("Update Vault", function () {
    it("Should update vault successfully", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      const tx = await vaultRegistry.connect(user1).updateVault(testCID2);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(vaultRegistry, "VaultUpdated")
        .withArgs(user1.address, testCID2, testCID1, block.timestamp);
      
      const vault = await vaultRegistry.getVault(user1.address);
      expect(vault.currentCID).to.equal(testCID2);
    });

    it("Should store previous CID in history when updating", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      await vaultRegistry.connect(user1).updateVault(testCID2);
      
      const history = await vaultRegistry.getVaultHistory(user1.address);
      expect(history.length).to.equal(1);
      expect(history[0]).to.equal(testCID1);
    });

    it("Should maintain multiple versions in history", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      await vaultRegistry.connect(user1).updateVault(testCID2);
      await vaultRegistry.connect(user1).updateVault(testCID3);
      
      const history = await vaultRegistry.getVaultHistory(user1.address);
      expect(history.length).to.equal(2);
      expect(history[0]).to.equal(testCID1);
      expect(history[1]).to.equal(testCID2);
      
      const vault = await vaultRegistry.getVault(user1.address);
      expect(vault.currentCID).to.equal(testCID3);
    });

    it("Should revert when updating non-existent vault", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await expect(vaultRegistry.connect(user1).updateVault(testCID1))
        .to.be.revertedWith("VaultDoesNotExist");
    });

    it("Should revert when updating with empty CID", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      await expect(vaultRegistry.connect(user1).updateVault(""))
        .to.be.revertedWith("EmptyCID");
    });

    it("Should update timestamp on vault update", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      const vault1 = await vaultRegistry.getVault(user1.address);
      
      await ethers.provider.send("evm_increaseTime", [3600]);
      await ethers.provider.send("evm_mine");
      
      await vaultRegistry.connect(user1).updateVault(testCID2);
      const vault2 = await vaultRegistry.getVault(user1.address);
      
      expect(vault2.lastUpdated).to.be.gt(vault1.lastUpdated);
    });
  });

  describe("Delete Vault", function () {
    it("Should delete vault successfully", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      const tx = await vaultRegistry.connect(user1).deleteVault();
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);
      
      await expect(tx)
        .to.emit(vaultRegistry, "VaultDeleted")
        .withArgs(user1.address, block.timestamp);
      
      const vault = await vaultRegistry.getVault(user1.address);
      expect(vault.exists).to.be.false;
      expect(vault.currentCID).to.equal("");
    });

    it("Should revert when deleting non-existent vault", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await expect(vaultRegistry.connect(user1).deleteVault())
        .to.be.revertedWith("VaultDoesNotExist");
    });

    it("Should allow re-registration after deletion", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      await vaultRegistry.connect(user1).deleteVault();
      await vaultRegistry.connect(user1).registerVault(testCID2);
      
      const vault = await vaultRegistry.getVault(user1.address);
      expect(vault.currentCID).to.equal(testCID2);
      expect(vault.exists).to.be.true;
    });

    it("Should clear history when vault is deleted", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      await vaultRegistry.connect(user1).updateVault(testCID2);
      await vaultRegistry.connect(user1).deleteVault();
      
      await expect(vaultRegistry.getVaultHistory(user1.address))
        .to.be.revertedWith("VaultDoesNotExist");
    });
  });

  describe("View Functions", function () {
    it("Should return correct vault data", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      const vault = await vaultRegistry.getVault(user1.address);
      expect(vault.currentCID).to.equal(testCID1);
      expect(vault.exists).to.be.true;
      expect(vault.lastUpdated).to.be.gt(0);
    });

    it("Should return false for non-existent vault", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      const hasVault = await vaultRegistry.hasVault(user1.address);
      expect(hasVault).to.be.false;
    });

    it("Should return true for existing vault", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      const hasVault = await vaultRegistry.hasVault(user1.address);
      expect(hasVault).to.be.true;
    });

    it("Should get current CID correctly", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      const currentCID = await vaultRegistry.getCurrentCID(user1.address);
      expect(currentCID).to.equal(testCID1);
    });

    it("Should revert when getting CID for non-existent vault", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await expect(vaultRegistry.getCurrentCID(user1.address))
        .to.be.revertedWith("VaultDoesNotExist");
    });

    it("Should get last updated timestamp correctly", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      const lastUpdated = await vaultRegistry.getLastUpdated(user1.address);
      expect(lastUpdated).to.be.gt(0);
    });

    it("Should get vault history length correctly", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      await vaultRegistry.connect(user1).updateVault(testCID2);
      await vaultRegistry.connect(user1).updateVault(testCID3);
      
      const historyLength = await vaultRegistry.getVaultHistoryLength(user1.address);
      expect(historyLength).to.equal(2);
    });

    it("Should get specific historical vault correctly", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      await vaultRegistry.connect(user1).updateVault(testCID2);
      await vaultRegistry.connect(user1).updateVault(testCID3);
      
      const historicalCID = await vaultRegistry.getSpecificHistoricalVault(user1.address, 0);
      expect(historicalCID).to.equal(testCID1);
    });

    it("Should revert when accessing history with invalid index", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      await expect(vaultRegistry.getSpecificHistoricalVault(user1.address, 5))
        .to.be.revertedWith("Index out of bounds");
    });

    it("Should return empty string for non-existent vault CID", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      const vault = await vaultRegistry.getVault(user1.address);
      expect(vault.currentCID).to.equal("");
      expect(vault.exists).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very long CID strings", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      const longCID = "Qm" + "a".repeat(500);
      
      await vaultRegistry.connect(user1).registerVault(longCID);
      const currentCID = await vaultRegistry.getCurrentCID(user1.address);
      expect(currentCID).to.equal(longCID);
    });

    it("Should handle multiple sequential updates", async function () {
      const { vaultRegistry, user1 } = await loadFixture(deployVaultRegistryFixture);
      
      await vaultRegistry.connect(user1).registerVault(testCID1);
      
      for (let i = 0; i < 5; i++) {
        await vaultRegistry.connect(user1).updateVault(`QmTestHash${i}`);
      }
      
      const historyLength = await vaultRegistry.getVaultHistoryLength(user1.address);
      expect(historyLength).to.equal(5);
    });
  });
});
