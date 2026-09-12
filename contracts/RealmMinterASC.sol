// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ASCBase} from "./ASCBase.sol";
import {EvmV1Decoder} from "@gluwa/usc-contracts/decoding/EvmV1Decoder.sol";

interface IRealmMinter {
    function mint(address to, uint256 amount) external;
}

/// @notice Attestcoin Smart Contract: verifies a Sepolia CoinBurnNotary tx and mints REALM.
contract RealmMinterASC is ASCBase {
    bytes32 public constant BURN_EVENT_SIGNATURE =
        keccak256("CoinBurnedForRealm(address,uint256,uint256,bytes32)");

    address public immutable notary;
    IRealmMinter public immutable realm;
    mapping(bytes32 => bool) public usedNonces;

    event RealmMintedFromAttestation(
        address indexed wallet,
        uint256 coinsBurned,
        uint256 realmAmount,
        bytes32 indexed nonce,
        bytes32 indexed queryId
    );

    constructor(address realmToken, address sepoliaNotary) {
        require(realmToken != address(0) && sepoliaNotary != address(0), "zero");
        realm = IRealmMinter(realmToken);
        notary = sepoliaNotary;
    }

    function _processAndEmitEvent(uint8 action, bytes32 queryId, bytes memory encodedTransaction)
        internal
        override
    {
        require(action == 0, "bad action");
        uint8 txType = EvmV1Decoder.getTransactionType(encodedTransaction);
        require(EvmV1Decoder.isValidTransactionType(txType), "Unsupported transaction type");

        EvmV1Decoder.ReceiptFields memory receipt = EvmV1Decoder.decodeReceiptFields(encodedTransaction);
        require(receipt.receiptStatus == 1, "Transaction did not succeed");

        EvmV1Decoder.LogEntry[] memory logs =
            EvmV1Decoder.getLogsByEventSignature(receipt, BURN_EVENT_SIGNATURE);
        require(logs.length > 0, "No burn events found");

        (address wallet, uint256 coinsBurned, uint256 realmAmount, bytes32 nonce) = _decodeBurn(logs[0]);
        require(!usedNonces[nonce], "nonce used");
        usedNonces[nonce] = true;
        realm.mint(wallet, realmAmount);
        emit RealmMintedFromAttestation(wallet, coinsBurned, realmAmount, nonce, queryId);
    }

    function _decodeBurn(EvmV1Decoder.LogEntry memory log)
        internal
        view
        returns (address wallet, uint256 coinsBurned, uint256 realmAmount, bytes32 nonce)
    {
        require(log.address_ == notary, "wrong notary");
        require(log.topics.length == 3, "topics");
        require(log.topics[0] == BURN_EVENT_SIGNATURE, "sig");
        wallet = address(uint160(uint256(log.topics[1])));
        nonce = log.topics[2];
        require(log.data.length == 64, "data");
        (coinsBurned, realmAmount) = abi.decode(log.data, (uint256, uint256));
        require(wallet != address(0) && realmAmount > 0, "payload");
    }
}
