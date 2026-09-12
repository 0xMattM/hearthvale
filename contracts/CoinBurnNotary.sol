// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/// @notice Sepolia source-chain notary. The game relayer posts coin-burn receipts here;
/// Attestcoin proves the tx on Creditcoin and RealmMinterASC mints REALM.
contract CoinBurnNotary {
    address public owner;
    mapping(bytes32 => bool) public usedNonces;

    event CoinBurnedForRealm(
        address indexed creditcoinWallet,
        uint256 coinsBurned,
        uint256 realmAmount,
        bytes32 indexed nonce
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address next) external onlyOwner {
        require(next != address(0), "zero");
        owner = next;
    }

    /// @notice Records that in-game coins were burned for REALM destined to `creditcoinWallet`.
    function notarize(
        address creditcoinWallet,
        uint256 coinsBurned,
        uint256 realmAmount,
        bytes32 nonce
    ) external onlyOwner {
        require(creditcoinWallet != address(0), "wallet");
        require(coinsBurned > 0 && realmAmount > 0, "amount");
        require(!usedNonces[nonce], "nonce");
        usedNonces[nonce] = true;
        emit CoinBurnedForRealm(creditcoinWallet, coinsBurned, realmAmount, nonce);
    }
}
