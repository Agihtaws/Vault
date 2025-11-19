// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FrontendRegistry {
    struct FrontendVersion {
        bytes32 contentHash;
        string version;
        uint256 timestamp;
        bool isActive;
        string description;
    }
    
    address public owner;
    address public pendingOwner;
    
    FrontendVersion[] public versions;
    mapping(bytes32 => uint256) public hashToIndex;
    mapping(bytes32 => bool) public registeredHashes;
    
    uint256 public currentVersionIndex;
    
    event FrontendRegistered(bytes32 indexed contentHash, string version, uint256 timestamp, string description);
    event FrontendDeprecated(bytes32 indexed contentHash, string version, uint256 timestamp);
    event FrontendReactivated(bytes32 indexed contentHash, string version, uint256 timestamp);
    event CurrentVersionUpdated(bytes32 indexed oldHash, bytes32 indexed newHash, uint256 timestamp);
    event OwnershipTransferInitiated(address indexed currentOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    error Unauthorized();
    error HashAlreadyRegistered();
    error HashNotRegistered();
    error InvalidHash();
    error InvalidVersion();
    error VersionNotActive();
    error InvalidAddress();
    error NoVersionsRegistered();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    
    modifier validHash(bytes32 contentHash) {
        if (contentHash == bytes32(0)) revert InvalidHash();
        _;
    }
    
    modifier validVersion(string memory version) {
        if (bytes(version).length == 0) revert InvalidVersion();
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerFrontend(
        bytes32 contentHash,
        string memory version,
        string memory description
    ) external onlyOwner validHash(contentHash) validVersion(version) {
        if (registeredHashes[contentHash]) revert HashAlreadyRegistered();
        
        FrontendVersion memory newVersion = FrontendVersion({
            contentHash: contentHash,
            version: version,
            timestamp: block.timestamp,
            isActive: true,
            description: description
        });
        
        uint256 index = versions.length;
        versions.push(newVersion);
        hashToIndex[contentHash] = index;
        registeredHashes[contentHash] = true;
        currentVersionIndex = index;
        
        emit FrontendRegistered(contentHash, version, block.timestamp, description);
    }
    
    function deprecateFrontend(bytes32 contentHash) external onlyOwner validHash(contentHash) {
        if (!registeredHashes[contentHash]) revert HashNotRegistered();
        
        uint256 index = hashToIndex[contentHash];
        FrontendVersion storage version = versions[index];
        
        if (!version.isActive) revert VersionNotActive();
        
        version.isActive = false;
        
        emit FrontendDeprecated(contentHash, version.version, block.timestamp);
    }
    
    function reactivateFrontend(bytes32 contentHash) external onlyOwner validHash(contentHash) {
        if (!registeredHashes[contentHash]) revert HashNotRegistered();
        
        uint256 index = hashToIndex[contentHash];
        FrontendVersion storage version = versions[index];
        
        if (version.isActive) revert("Version already active");
        
        version.isActive = true;
        
        emit FrontendReactivated(contentHash, version.version, block.timestamp);
    }
    
    function setCurrentVersion(bytes32 contentHash) external onlyOwner validHash(contentHash) {
        if (!registeredHashes[contentHash]) revert HashNotRegistered();
        
        uint256 index = hashToIndex[contentHash];
        FrontendVersion storage version = versions[index];
        
        if (!version.isActive) revert VersionNotActive();
        
        bytes32 oldHash = versions[currentVersionIndex].contentHash;
        currentVersionIndex = index;
        
        emit CurrentVersionUpdated(oldHash, contentHash, block.timestamp);
    }
    
    function verifyFrontend(bytes32 contentHash) external view returns (bool isValid, bool isActive, string memory version) {
        if (!registeredHashes[contentHash]) {
            return (false, false, "");
        }
        
        uint256 index = hashToIndex[contentHash];
        FrontendVersion storage versionData = versions[index];
        
        return (true, versionData.isActive, versionData.version);
    }
    
    function getCurrentVersion() external view returns (
        bytes32 contentHash,
        string memory version,
        uint256 timestamp,
        bool isActive,
        string memory description
    ) {
        if (versions.length == 0) revert NoVersionsRegistered();
        
        FrontendVersion storage current = versions[currentVersionIndex];
        return (
            current.contentHash,
            current.version,
            current.timestamp,
            current.isActive,
            current.description
        );
    }
    
    function getVersion(bytes32 contentHash) external view returns (
        string memory version,
        uint256 timestamp,
        bool isActive,
        string memory description
    ) {
        if (!registeredHashes[contentHash]) revert HashNotRegistered();
        
        uint256 index = hashToIndex[contentHash];
        FrontendVersion storage versionData = versions[index];
        
        return (
            versionData.version,
            versionData.timestamp,
            versionData.isActive,
            versionData.description
        );
    }
    
    function getVersionByIndex(uint256 index) external view returns (
        bytes32 contentHash,
        string memory version,
        uint256 timestamp,
        bool isActive,
        string memory description
    ) {
        if (index >= versions.length) revert("Index out of bounds");
        
        FrontendVersion storage versionData = versions[index];
        
        return (
            versionData.contentHash,
            versionData.version,
            versionData.timestamp,
            versionData.isActive,
            versionData.description
        );
    }
    
    function getAllVersions() external view returns (FrontendVersion[] memory) {
        return versions;
    }
    
    function getActiveVersions() external view returns (FrontendVersion[] memory) {
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < versions.length; i++) {
            if (versions[i].isActive) {
                activeCount++;
            }
        }
        
        FrontendVersion[] memory activeVersions = new FrontendVersion[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < versions.length; i++) {
            if (versions[i].isActive) {
                activeVersions[currentIndex] = versions[i];
                currentIndex++;
            }
        }
        
        return activeVersions;
    }
    
    function getTotalVersions() external view returns (uint256) {
        return versions.length;
    }
    
    function isHashRegistered(bytes32 contentHash) external view returns (bool) {
        return registeredHashes[contentHash];
    }
    
    function isCurrentVersion(bytes32 contentHash) external view returns (bool) {
        if (versions.length == 0) return false;
        return versions[currentVersionIndex].contentHash == contentHash;
    }
    
    function initiateOwnershipTransfer(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        pendingOwner = newOwner;
        emit OwnershipTransferInitiated(owner, newOwner);
    }
    
    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert Unauthorized();
        
        address previousOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        
        emit OwnershipTransferred(previousOwner, owner);
    }
    
    function cancelOwnershipTransfer() external onlyOwner {
        pendingOwner = address(0);
    }
}
