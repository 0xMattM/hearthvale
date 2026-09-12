// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {RealmToken} from "../contracts/RealmToken.sol";
import {CoinBurnNotary} from "../contracts/CoinBurnNotary.sol";
import {RealmMinterASC} from "../contracts/RealmMinterASC.sol";

/// @notice Compiles the Attestcoin ASC and locks the Sepolia burn event signature.
contract RealmMinterAscTest {
    function testBurnEventSignatureMatchesNotary() public {
        require(
            RealmMinterASC.BURN_EVENT_SIGNATURE
                == keccak256("CoinBurnedForRealm(address,uint256,uint256,bytes32)"),
            "sig"
        );
    }

    function testAscConstructorRejectsZero() public {
        RealmToken token = new RealmToken();
        CoinBurnNotary notary = new CoinBurnNotary();
        try new RealmMinterASC(address(0), address(notary)) {
            revert("zero realm");
        } catch {}
        try new RealmMinterASC(address(token), address(0)) {
            revert("zero notary");
        } catch {}
        RealmMinterASC asc = new RealmMinterASC(address(token), address(notary));
        require(asc.notary() == address(notary), "notary");
        require(address(asc.realm()) == address(token), "realm");
    }
}
