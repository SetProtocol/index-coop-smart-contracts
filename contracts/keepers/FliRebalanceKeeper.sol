/*
    Copyright 2021 Index Cooperative.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

pragma solidity 0.6.10;
pragma experimental ABIEncoderV2;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { KeeperCompatibleInterface } from "@chainlink/contracts/src/v0.6/KeeperCompatible.sol";

/**
 * @title RebalanceKeeper
 * @author Index Cooperative
 * 
 * Chainlink Keeper which automatically rebalances FLI SetTokens.
 */
contract FliRebalanceKeeper is KeeperCompatibleInterface {
    using Address for address;

    /* ============ Modifiers ============ */
    modifier onlyRegistry() {
        require(msg.sender == registryAddress, "Only registry address can call this function");
        _;
    }

    /* ============ State Variables ============ */

    address public fliExtension;                          // Address of the fli extension contract
    address public registryAddress;                       // Address of the chainlink keeper registry

    /* ============ Constructor ============ */
    constructor(address _fliExtension, address _registryAddress) public {
        fliExtension = _fliExtension;
        registryAddress = _registryAddress;
    }    

    function checkUpkeep(bytes calldata /* checkData */) external override onlyRegistry returns (bool, bytes memory) {
        bytes memory callData = getRebalanceCalldata(); 
        return (callData.length > 0, callData);
    }

    function performUpkeep(bytes calldata performData) external override onlyRegistry {
        bytes memory callData = getRebalanceCalldata();
        // require(callData.equals(performData), "Rebalance callData not equal to performData");
        Address.functionCall(fliExtension, callData);
    }

    function getRebalanceCalldata() private returns (bytes memory) {
        bytes memory shouldRebalanceCalldata = abi.encodeWithSignature("shouldRebalance()");
        bytes memory shouldRebalanceResponse = Address.functionCall(address(fliExtension), shouldRebalanceCalldata, "Failed to execute shouldRebalance()");
        (string[] memory exchangeNames, uint256[] memory shouldRebalances) = abi.decode(shouldRebalanceResponse, (string[], uint256[]));
        string memory name = exchangeNames[0];
        uint256 shouldRebalance = shouldRebalances[0];

        if (shouldRebalance == 1) {
            return abi.encodeWithSignature("rebalance(string)", [name]);
        } else if (shouldRebalance == 2) {
            return abi.encodeWithSignature("iterateRebalance(string)", [name]);
        } else if (shouldRebalance == 3) {
            return abi.encodeWithSignature("ripcord(string)", [name]);
        }
        return new bytes(0);
    }
}
