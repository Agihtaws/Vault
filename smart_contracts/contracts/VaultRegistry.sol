// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VaultRegistry {
    struct VaultData {
        string currentCID;
        uint256 lastUpdated;
        string[] previousCIDs;
        bool exists;
    }
    
    mapping(address => VaultData) private vaults;
    
    event VaultRegistered(address indexed user, string ipfsCID, uint256 timestamp);
    event VaultUpdated(address indexed user, string newCID, string oldCID, uint256 timestamp);
    event VaultDeleted(address indexed user, uint256 timestamp);
    
    error VaultAlreadyExists();
    error VaultDoesNotExist();
    error EmptyCID();
    error Unauthorized();
    
    modifier onlyVaultOwner() {
        if (!vaults[msg.sender].exists) revert VaultDoesNotExist();
        _;
    }
    
    modifier validCID(string memory cid) {
        if (bytes(cid).length == 0) revert EmptyCID();
        _;
    }
    
    function registerVault(string memory ipfsCID) external validCID(ipfsCID) {
        if (vaults[msg.sender].exists) revert VaultAlreadyExists();
        
        VaultData storage vault = vaults[msg.sender];
        vault.currentCID = ipfsCID;
        vault.lastUpdated = block.timestamp;
        vault.exists = true;
        
        emit VaultRegistered(msg.sender, ipfsCID, block.timestamp);
    }
    
    function updateVault(string memory newCID) external onlyVaultOwner validCID(newCID) {
        VaultData storage vault = vaults[msg.sender];
        string memory oldCID = vault.currentCID;
        
        vault.previousCIDs.push(oldCID);
        vault.currentCID = newCID;
        vault.lastUpdated = block.timestamp;
        
        emit VaultUpdated(msg.sender, newCID, oldCID, block.timestamp);
    }
    
    function deleteVault() external onlyVaultOwner {
        delete vaults[msg.sender];
        emit VaultDeleted(msg.sender, block.timestamp);
    }
    
    function getVault(address user) external view returns (
        string memory currentCID,
        uint256 lastUpdated,
        bool exists
    ) {
        VaultData storage vault = vaults[user];
        return (vault.currentCID, vault.lastUpdated, vault.exists);
    }
    
    function getVaultHistory(address user) external view returns (string[] memory) {
        if (!vaults[user].exists) revert VaultDoesNotExist();
        return vaults[user].previousCIDs;
    }
    
    function getVaultHistoryLength(address user) external view returns (uint256) {
        if (!vaults[user].exists) revert VaultDoesNotExist();
        return vaults[user].previousCIDs.length;
    }
    
    function getSpecificHistoricalVault(address user, uint256 index) external view returns (string memory) {
        if (!vaults[user].exists) revert VaultDoesNotExist();
        if (index >= vaults[user].previousCIDs.length) revert("Index out of bounds");
        return vaults[user].previousCIDs[index];
    }
    
    function hasVault(address user) external view returns (bool) {
        return vaults[user].exists;
    }
    
    function getCurrentCID(address user) external view returns (string memory) {
        if (!vaults[user].exists) revert VaultDoesNotExist();
        return vaults[user].currentCID;
    }
    
    function getLastUpdated(address user) external view returns (uint256) {
        if (!vaults[user].exists) revert VaultDoesNotExist();
        return vaults[user].lastUpdated;
    }
}
