/*
    Copyright 2022 Index Cooperative

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
import { IUniswapV2Router02 } from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import { PreciseUnitMath } from "../lib/PreciseUnitMath.sol";

/**
 * @title DEXAdapter
 * @author Index Coop
 *
 * Adapter to execute swaps on different DEXes
 *
 */
abstract contract DEXAdapter {
    using SafeERC20 for IERC20;
    using PreciseUnitMath for uint256;

    /* ============ Constants ============= */
    uint256 constant private MAX_UINT256 = type(uint256).max;

    /* ============ Enums ============ */
    enum Exchange { None, Quickswap, Sushiswap}

    // Token to trade via 
    address immutable public INTERMEDIATE_TOKEN;
    IUniswapV2Router02 immutable public quickRouter;
    IUniswapV2Router02 immutable public sushiRouter;

    constructor(
        address _weth,
        address _intermediateToken,
        IUniswapV2Router02 _quickRouter,
        IUniswapV2Router02 _sushiRouter
    )
        public
    {
        quickRouter = _quickRouter;
        sushiRouter = _sushiRouter;

        IERC20(_weth).safeApprove(address(_quickRouter), PreciseUnitMath.maxUint256());
        IERC20(_weth).safeApprove(address(_sushiRouter), PreciseUnitMath.maxUint256());

        INTERMEDIATE_TOKEN = _intermediateToken;
        if(_intermediateToken != _weth) {
            IERC20(_intermediateToken).safeApprove(address(_quickRouter), PreciseUnitMath.maxUint256());
            IERC20(_intermediateToken).safeApprove(address(_sushiRouter), PreciseUnitMath.maxUint256());
        }
    }

    /**
     * Swap exact tokens for another token on a given DEX.
     *
     * @param _exchange     The exchange on which to peform the swap
     * @param _tokenIn      The address of the input token
     * @param _tokenOut     The address of the output token
     * @param _amountIn     The amount of input token to be spent
     *
     * @return              The amount of output tokens
     */
    function _swapExactTokensForTokens(
        Exchange _exchange,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn
    )
    internal
    returns (uint256)
    {
        if (_tokenIn == _tokenOut) {
            return _amountIn;
        }

        address[] memory path = _generatePath(_tokenIn, _tokenOut);
        IUniswapV2Router02 router = _getRouter(_exchange);
        _safeApprove(IERC20(_tokenIn), address(router), _amountIn);
        //TODO: Review if we have to set a non-zero minAmountOut
        return router.swapExactTokensForTokens(_amountIn, 0, path, address(this), block.timestamp)[1];
    }

    /**
     * Swap tokens for exact amount of output tokens on a given DEX.
     *
     * @param _exchange     The exchange on which to peform the swap
     * @param _tokenIn      The address of the input token
     * @param _tokenOut     The address of the output token
     * @param _amountOut    The amount of output token required
     * @param _maxAmountIn  Maximum amount of input token to be spent
     *
     * @return              The amount of input tokens spent
     */
    function _swapTokensForExactTokens(
        Exchange _exchange,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountOut,
        uint256 _maxAmountIn
    )
    internal
    returns (uint256)
    {
        if (_tokenIn == _tokenOut) {
            return _amountOut;
        }
        IUniswapV2Router02 router = _getRouter(_exchange);
        _safeApprove(IERC20(_tokenIn), address(router), _maxAmountIn);
        address[] memory path = _generatePath(_tokenIn, _tokenOut);
        uint256 result = router.swapTokensForExactTokens(_amountOut, _maxAmountIn, path, address(this), block.timestamp)[0];
        return result;
    }

    function _generatePath(address _tokenIn, address _tokenOut) internal view returns (address[] memory) {
        address[] memory path;
        if(_tokenIn == INTERMEDIATE_TOKEN || _tokenOut == INTERMEDIATE_TOKEN){
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            path = new address[](3);
            path[0] = _tokenIn;
            path[1] = INTERMEDIATE_TOKEN;
            path[2] = _tokenOut;
        }
        return path;
    }

    /**
     * Returns the router address of a given exchange.
     *
     * @param _exchange     The Exchange whose router address is needed
     *
     * @return              IUniswapV2Router02 router of the given exchange
     */
     function _getRouter(Exchange _exchange) internal view returns(IUniswapV2Router02) {
         return (_exchange == Exchange.Quickswap) ? quickRouter : sushiRouter;
     }

    /**
     * Sets a max approval limit for an ERC20 token, provided the current allowance
     * is less than the required allownce.
     *
     * @param _token              Token to approve
     * @param _spender            Spender address to approve
     * @param _requiredAllowance  Target allowance to set
     */
    function _safeApprove(IERC20 _token, address _spender, uint256 _requiredAllowance) internal {
        uint256 allowance = _token.allowance(address(this), _spender);
        if (allowance < _requiredAllowance) {
            _token.safeIncreaseAllowance(_spender, MAX_UINT256 - allowance);
        }
    }

}
