// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IRealmTokenPay {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @notice Player item listings priced in REALM. Game server escrows goods; this contract settles payment.
contract ItemMarketplace {
    struct Listing {
        address seller;
        bytes32 itemId;
        uint256 qty;
        uint256 priceRealm;
        bytes32 gameListingId;
        bool active;
    }

    IRealmTokenPay public immutable realm;
    uint256 public nextListingId = 1;
    mapping(uint256 => Listing) public listings;
    mapping(bytes32 => uint256) public listingIdByGameId;

    event ItemListed(
        uint256 indexed listingId,
        address indexed seller,
        bytes32 itemId,
        uint256 qty,
        uint256 priceRealm,
        bytes32 gameListingId
    );
    event ItemSold(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 priceRealm);
    event ItemCancelled(uint256 indexed listingId, address indexed seller);

    constructor(address realmToken) {
        realm = IRealmTokenPay(realmToken);
    }

    function listItem(bytes32 itemId, uint256 qty, uint256 priceRealm, bytes32 gameListingId)
        external
        returns (uint256 listingId)
    {
        require(qty > 0 && priceRealm > 0, "bad args");
        require(gameListingId != bytes32(0), "game id");
        require(listingIdByGameId[gameListingId] == 0, "already listed");
        listingId = nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            itemId: itemId,
            qty: qty,
            priceRealm: priceRealm,
            gameListingId: gameListingId,
            active: true
        });
        listingIdByGameId[gameListingId] = listingId;
        emit ItemListed(listingId, msg.sender, itemId, qty, priceRealm, gameListingId);
    }

    function buyItem(uint256 listingId) external {
        Listing storage row = listings[listingId];
        require(row.active, "inactive");
        require(row.seller != msg.sender, "own listing");
        row.active = false;
        require(realm.transferFrom(msg.sender, row.seller, row.priceRealm), "realm pay");
        emit ItemSold(listingId, msg.sender, row.seller, row.priceRealm);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage row = listings[listingId];
        require(row.active, "inactive");
        require(row.seller == msg.sender, "not seller");
        row.active = false;
        emit ItemCancelled(listingId, msg.sender);
    }
}
