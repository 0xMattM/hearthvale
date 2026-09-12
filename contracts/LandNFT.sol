// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IRealmToken {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @notice ERC-721 land parcels purchased with REALM on Creditcoin. Ownership only — never combat.
contract LandNFT {
    string public constant name = "Realm Land";
    string public constant symbol = "RLAND";

    IRealmToken public immutable realm;
    address public owner;
    uint256 public nextTokenId = 1;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(uint256 => uint256)) public tokenOfOwnerByIndex;
    mapping(uint256 => uint256) public tokenIndexInOwner;
    mapping(uint256 => uint8) public landBiome;
    mapping(uint256 => uint8) public landSize;
    mapping(uint256 => address) public landMinter;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    mapping(uint256 => address) public getApproved;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    event LandMinted(address indexed to, uint256 indexed tokenId, uint8 biome, uint8 size, uint256 price);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address realmToken) {
        owner = msg.sender;
        realm = IRealmToken(realmToken);
    }

    /// @notice REALM wei price by size: 0 small / 1 medium / 2 large.
    function landPrice(uint8 size) public pure returns (uint256) {
        if (size == 0) return 5 ether;
        if (size == 1) return 15 ether;
        if (size == 2) return 40 ether;
        revert("bad size");
    }

    function mintLand(uint8 biome, uint8 size) external returns (uint256 tokenId) {
        require(biome < 3, "bad biome");
        uint256 price = landPrice(size);
        require(realm.transferFrom(msg.sender, owner, price), "realm pay");
        tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        landBiome[tokenId] = biome;
        landSize[tokenId] = size;
        landMinter[tokenId] = msg.sender;
        emit LandMinted(msg.sender, tokenId, biome, size, price);
    }

    function getLand(uint256 tokenId) external view returns (uint8 biome, uint8 size, address minter) {
        require(ownerOf[tokenId] != address(0), "missing");
        return (landBiome[tokenId], landSize[tokenId], landMinter[tokenId]);
    }

    function approve(address approved, uint256 tokenId) external {
        require(ownerOf[tokenId] == msg.sender || isApprovedForAll[ownerOf[tokenId]][msg.sender], "not owner");
        getApproved[tokenId] = approved;
        emit Approval(ownerOf[tokenId], approved, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        require(to != address(0), "zero to");
        require(ownerOf[tokenId] == from, "not from");
        require(
            msg.sender == from || getApproved[tokenId] == msg.sender || isApprovedForAll[from][msg.sender],
            "not approved"
        );
        getApproved[tokenId] = address(0);
        _removeFromOwner(from, tokenId);
        _addToOwner(to, tokenId);
        emit Transfer(from, to, tokenId);
    }

    function _mint(address to, uint256 tokenId) internal {
        require(ownerOf[tokenId] == address(0), "exists");
        _addToOwner(to, tokenId);
        emit Transfer(address(0), to, tokenId);
    }

    function _addToOwner(address to, uint256 tokenId) internal {
        uint256 idx = balanceOf[to];
        tokenOfOwnerByIndex[to][idx] = tokenId;
        tokenIndexInOwner[tokenId] = idx;
        balanceOf[to] += 1;
        ownerOf[tokenId] = to;
    }

    function _removeFromOwner(address from, uint256 tokenId) internal {
        uint256 last = balanceOf[from] - 1;
        uint256 idx = tokenIndexInOwner[tokenId];
        if (idx != last) {
            uint256 moved = tokenOfOwnerByIndex[from][last];
            tokenOfOwnerByIndex[from][idx] = moved;
            tokenIndexInOwner[moved] = idx;
        }
        delete tokenOfOwnerByIndex[from][last];
        balanceOf[from] = last;
        ownerOf[tokenId] = address(0);
    }
}
