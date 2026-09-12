// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {RealmToken} from "../contracts/RealmToken.sol";
import {LandNFT} from "../contracts/LandNFT.sol";
import {ItemMarketplace} from "../contracts/ItemMarketplace.sol";
import {CoinBurnNotary} from "../contracts/CoinBurnNotary.sol";

/// @dev Buyer/seller actor so tests do not need forge-std vm.prank.
contract WalletActor {
    function mintFrom(RealmToken token, address to, uint256 amount) external {
        token.mint(to, amount);
    }

    function approve(RealmToken token, address spender, uint256 amount) external {
        token.approve(spender, amount);
    }

    function listItem(
        ItemMarketplace market,
        bytes32 itemId,
        uint256 qty,
        uint256 priceRealm,
        bytes32 gameListingId
    ) external returns (uint256) {
        return market.listItem(itemId, qty, priceRealm, gameListingId);
    }

    function buyItem(ItemMarketplace market, uint256 listingId) external {
        market.buyItem(listingId);
    }

    function mintLand(LandNFT lands, uint8 biome, uint8 size) external returns (uint256) {
        return lands.mintLand(biome, size);
    }

    function notarize(
        CoinBurnNotary notary,
        address wallet,
        uint256 coinsBurned,
        uint256 realmAmount,
        bytes32 nonce
    ) external {
        notary.notarize(wallet, coinsBurned, realmAmount, nonce);
    }
}

/// @notice Economy + Sepolia notary tests for BUIDL CTC judges (`forge test`).
contract RealmEconomyTest {
    function testDeployerCanMintRealm() public {
        RealmToken token = new RealmToken();
        token.mint(address(this), 10 ether);
        require(token.balanceOf(address(this)) == 10 ether, "mint");
        require(token.totalSupply() == 10 ether, "supply");
    }

    function testStrangerCannotMint() public {
        RealmToken token = new RealmToken();
        WalletActor stranger = new WalletActor();
        try stranger.mintFrom(token, address(stranger), 1 ether) {
            revert("stranger minted");
        } catch {}
        require(token.balanceOf(address(stranger)) == 0, "no mint");
    }

    function testLandMintPaysRealmAndSetsOwner() public {
        RealmToken token = new RealmToken();
        LandNFT lands = new LandNFT(address(token));
        WalletActor player = new WalletActor();
        token.mint(address(player), 5 ether);
        player.approve(token, address(lands), 5 ether);
        uint256 id = player.mintLand(lands, 0, 0);
        require(lands.ownerOf(id) == address(player), "owner");
        require(token.balanceOf(address(this)) == 5 ether, "treasury");
        (uint8 biome, uint8 size,) = lands.getLand(id);
        require(biome == 0 && size == 0, "meta");
    }

    function testMarketBuyPaysSellerAndDeactivates() public {
        RealmToken token = new RealmToken();
        ItemMarketplace market = new ItemMarketplace(address(token));
        WalletActor seller = new WalletActor();
        WalletActor buyer = new WalletActor();
        token.mint(address(buyer), 3 ether);
        buyer.approve(token, address(market), 3 ether);
        uint256 listingId = seller.listItem(market, bytes32("wheat"), 2, 3 ether, bytes32("gid-1"));
        buyer.buyItem(market, listingId);
        require(token.balanceOf(address(seller)) == 3 ether, "seller paid");
        (,,,,, bool active) = market.listings(listingId);
        require(!active, "inactive after sale");
    }

    function testMarketBuyWithoutAllowanceKeepsListingActive() public {
        RealmToken token = new RealmToken();
        ItemMarketplace market = new ItemMarketplace(address(token));
        WalletActor seller = new WalletActor();
        WalletActor buyer = new WalletActor();
        token.mint(address(buyer), 3 ether);
        uint256 listingId = seller.listItem(market, bytes32("wheat"), 1, 3 ether, bytes32("gid-2"));
        try buyer.buyItem(market, listingId) {
            revert("buy should revert");
        } catch {}
        (,,,,, bool active) = market.listings(listingId);
        require(active, "listing rolled back");
    }

    function testNotaryOwnerOnlyAndNonceReplay() public {
        CoinBurnNotary notary = new CoinBurnNotary();
        bytes32 nonce = keccak256("swap-1");
        notary.notarize(address(0xBEEF), 10, 1 ether, nonce);
        require(notary.usedNonces(nonce), "nonce marked");
        try notary.notarize(address(0xBEEF), 10, 1 ether, nonce) {
            revert("replay");
        } catch {}
        WalletActor stranger = new WalletActor();
        try stranger.notarize(notary, address(0xBEEF), 10, 1 ether, keccak256("swap-2")) {
            revert("stranger notarized");
        } catch {}
        require(!notary.usedNonces(keccak256("swap-2")), "stranger nonce");
    }
}
