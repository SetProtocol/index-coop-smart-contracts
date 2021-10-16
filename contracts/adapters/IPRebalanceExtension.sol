/*
    Copyright 2021 Index Coop.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

    SPDX-License-Identifier: Apache License, Version 2.0
*/

pragma solidity 0.6.10;
pragma experimental ABIEncoderV2;

import { SafeCast } from "@openzeppelin/contracts/utils/SafeCast.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";

import { BaseExtension } from "../lib/BaseExtension.sol";
import { GIMExtension } from "./GIMExtension.sol";
import { IBaseManager } from "../interfaces/IBaseManager.sol";
import { IGeneralIndexModule } from "../interfaces/IGeneralIndexModule.sol";
import { ISetToken } from "../interfaces/ISetToken.sol";
import { ITransformHelper } from "../interfaces/ITransformHelper.sol";
import { PreciseUnitMath } from "../lib/PreciseUnitMath.sol";


contract IPRebalanceExtension is GIMExtension {
    using PreciseUnitMath for uint256;
    using SafeCast for int256;
    using SafeCast for uint256;
    using SafeMath for uint256;

    /* ============ Structs =========== */

    struct TransformInfo {
        address underlyingComponent;
        ITransformHelper transformHelper;
    }

    /* ========== State Variables ========= */
    
    uint256 public untransforms;
    uint256 public transforms;

    mapping(address => uint256) public untransformUnits;
    mapping(address => uint256) public transformUnits;

    mapping(address => TransformInfo) public transformComponentInfo;

    mapping(address => uint256) public rebalanceParams;
    address[] public setComponentList;

    bool public tradesComplete;

    /* ========== Constructor ========== */

    constructor(IBaseManager _manager, IGeneralIndexModule _generalIndexModule) public GIMExtension(_manager, _generalIndexModule) {}

    /* ======== External Functions ======== */

    function startRebalanceWithUnits(
        address[] calldata /* _components */,
        uint256[] calldata /* _targetUnitsUnderlying */,
        uint256 /* _posotionMultiplier */
    )
        external
        onlyOperator
        override
    {
        revert("use startIPRebalance instead");
    }

    function setTransformInfo(address _transformComponent, TransformInfo memory _transformInfo) external onlyOperator {
        require(
            transformComponentInfo[_transformComponent].underlyingComponent == address(0),
            "TransformInfo already set"
        );
        transformComponentInfo[_transformComponent] = _transformInfo;
    }

    function updateTransformInfo(address _transformComponent, TransformInfo memory _transformInfo) external onlyOperator {
        require(
            transformComponentInfo[_transformComponent].underlyingComponent != address(0),
            "TransformInfo not set yet"
        );
        transformComponentInfo[_transformComponent] = _transformInfo;
    }

    function startIPRebalance(address[] memory _setComponents, uint256[] memory _targetUnitsUnderlying) external onlyOperator {
        require(_setComponents.length == _targetUnitsUnderlying.length, "length mismatch");

        // TODO: clear out startingUnderlyingComponent units

        for (uint256 i = 0; i < _setComponents.length; i++) {
            if (_isTransformComponent(_setComponents[i])) {

                uint256 currentUnits = setToken.getDefaultPositionRealUnit(_setComponents[i]).toUint256();

                // convert target units from underlying to transformed amounts
                TransformInfo memory transformInfo = transformComponentInfo[_setComponents[i]];
                uint256 exchangeRate = transformInfo.transformHelper.getExchangeRate(transformInfo.underlyingComponent, _setComponents[i]);
                uint256 targetUnitsInTransformed = _targetUnitsUnderlying[i].preciseMul(exchangeRate);

                uint256 unitsToUntransform = currentUnits > targetUnitsInTransformed ? currentUnits.sub(targetUnitsInTransformed) : 0;

                if (unitsToUntransform > 0) {
                    untransforms++;
                    untransformUnits[_setComponents[i]] = unitsToUntransform;
                }
            }

            // saves rebalance parameters for later use to start rebalance through GIM when untransforming is complete
            rebalanceParams[_setComponents[i]] = _targetUnitsUnderlying[i];
        }

        setComponentList = _setComponents;
    }

    function batchExecuteUntransform(
        address[] memory _transformComponents,
        bytes[] memory _untransformData
    )
        external
        onlyAllowedCaller(msg.sender)
    {
        require(_transformComponents.length == _untransformData.length, "length mismatch");

        _absorbAirdrops(_transformComponents);

        for (uint256 i = 0; i < _transformComponents.length; i++) {
            _executeUntransform(_transformComponents[i], _untransformData[i]);
        }
    }

    function setTradesComplete() external onlyOperator {
        tradesComplete = true;
        for (uint256 i = 0; i < setComponentList.length; i++) {
            address component = setComponentList[i];
            if (_isTransformComponent(component)) {

                TransformInfo memory transformInfo = transformComponentInfo[component];

                uint256 currentUnits = setToken.getDefaultPositionRealUnit(component).toUint256();
                uint256 exchangeRate = transformInfo.transformHelper.getExchangeRate(transformInfo.underlyingComponent, component);
                uint256 currentUnitsUnderlying = currentUnits.preciseDiv(exchangeRate);

                uint256 targetUnitsUnderlying = rebalanceParams[component];

                uint256 unitsToTransform = targetUnitsUnderlying.sub(currentUnitsUnderlying);

                if (unitsToTransform > 0) {
                    transforms++;
                    transformUnits[component] = unitsToTransform;
                }
            }
        }
    }

    function batchExecuteTransform(
        address[] memory _transformComponents,
        bytes[] memory _transformData
    )
        external
        onlyAllowedCaller(msg.sender)
    {
        require(_transformComponents.length == _transformData.length, "length mismatch");

        _absorbAirdrops(_transformComponents);

        for (uint256 i = 0; i < _transformComponents.length; i++) {
            _executeTransform(_transformComponents[i], _transformData[i]);
        }
    }

    /* ======== Internal Functions ======== */

    function _executeUntransform(address _transformComponent, bytes memory _untransformData) internal {

        uint256 unitsToUntransform = untransformUnits[_transformComponent];
        require(unitsToUntransform > 0 && untransforms > 0, "nothing to untransform");

        TransformInfo memory transformInfo = transformComponentInfo[_transformComponent];

        require(
            transformInfo.transformHelper.shouldUntransform(transformInfo.underlyingComponent, _transformComponent),
            "untransform unavailable"
        );

        (address module, bytes memory callData) = transformInfo.transformHelper.getUntransformCall(
            manager.setToken(),
            transformInfo.underlyingComponent,
            _transformComponent,
            unitsToUntransform,
            _untransformData
        );

        invokeManager(module, callData);

        untransformUnits[_transformComponent] = 0;
        untransforms--;

        // if done untransforming begin the rebalance through GIM
        if (untransforms == 0) {
            _startGIMRebalance();
        }
    }

    function _executeTransform(address _transformComponent, bytes memory _transformData) internal {

        uint256 unitsToTransform = transformUnits[_transformComponent];
        require(unitsToTransform > 0 && transforms > 0, "nothing to transform");

        TransformInfo memory transformInfo = transformComponentInfo[_transformComponent];

        require(
            transformInfo.transformHelper.shouldTransform(transformInfo.underlyingComponent, _transformComponent),
            "transform unavailable"
        );

        (address module, bytes memory callData) = transformInfo.transformHelper.getTransformCall(
            manager.setToken(),
            transformInfo.underlyingComponent,
            _transformComponent,
            unitsToTransform,
            _transformData
        );

        invokeManager(module, callData);

        transformUnits[_transformComponent] = 0;
        transforms--;

        if (transforms == 0) {
            tradesComplete = false;
        }
    }

    function _startGIMRebalance() internal {
        
        uint256[] memory rebalanceTargets = new uint256[](setComponentList.length);

        for (uint256 i = 0; i < setComponentList.length; i++) {
            if (_isTransformComponent(setComponentList[i])) {
                rebalanceTargets[i] = setToken.getDefaultPositionRealUnit(setComponentList[i]).toUint256();
            } else {

                uint256 finalTotalUnderlyingUnits = _getFinalTotalUnderlyingUnits(setComponentList[i], setComponentList);
                uint256 currentTotalUnderlyingUnits = _getCurrentTotalUnderlyingUnits(setComponentList[i], setComponentList);

                uint256 targetUnderlying = rebalanceParams[setComponentList[i]];
                int256 diff = finalTotalUnderlyingUnits.toInt256() - currentTotalUnderlyingUnits.toInt256() + targetUnderlying.toInt256();

                if (diff > 0) {
                    rebalanceTargets[i] = diff.toUint256();
                } else {
                    rebalanceTargets[i] = 0;
                }
            }
        }

        (
            address[] memory newComponents,
            uint256[] memory newComponentsTargetUnits,
            uint256[] memory oldComponentsTargetUnits
        ) =_sortNewAndOldComponents(setComponentList, rebalanceTargets);

        bytes memory callData = abi.encodeWithSelector(
            IGeneralIndexModule.startRebalance.selector,
            setToken,
            newComponents,
            newComponentsTargetUnits,
            oldComponentsTargetUnits,
            setToken.positionMultiplier()
        );

        invokeManager(address(generalIndexModule), callData);
    }

    function _absorbAirdrops(address[] memory _components) internal {
        //TODO: absorb airdrops
    }

    function _isTransformComponent(address _component) internal view returns (bool) {
        return transformComponentInfo[_component].underlyingComponent != address(0);
    }

    function _getFinalTotalUnderlyingUnits(address _underlying, address[] memory _components) internal view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < _components.length; i++) {
            if (transformComponentInfo[_components[i]].underlyingComponent == _underlying) {
                sum += rebalanceParams[_components[i]];
            }
        }
        return sum;
    }

    function _getCurrentTotalUnderlyingUnits(address _underlying, address[] memory _components) internal view returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < _components.length; i++) {
            if (transformComponentInfo[_components[i]].underlyingComponent == _underlying) {
                ITransformHelper transformHelper = transformComponentInfo[_components[i]].transformHelper;
                uint256 exchangeRate = transformHelper.getExchangeRate(_underlying, _components[i]);
                
                uint256 currentUnderlying = setToken.getDefaultPositionRealUnit(_components[i]).toUint256().preciseDiv(exchangeRate);
                sum += currentUnderlying;
            }
        }
        return sum;
    }
}