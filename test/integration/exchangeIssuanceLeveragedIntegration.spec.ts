import "module-alias/register";
import { Address, Account } from "@utils/types";
import DeployHelper from "@utils/deploys";
import { getAccounts, getWaffleExpect } from "@utils/index";
import { SetToken } from "@utils/contracts/setV2";
import { ethers } from "hardhat";
import { utils, BigNumber } from "ethers";
import { ExchangeIssuanceLeveraged, StandardTokenMock } from "@utils/contracts/index";
import { ILeverageModule, IUniswapV2Router } from "../../typechain";
import { MAX_UINT_256, ZERO } from "@utils/constants";

const expect = getWaffleExpect();

enum Exchange {
  None,
  Sushiswap,
}

if (process.env.INTEGRATIONTEST) {
  describe("ExchangeIssuanceLeveraged - Integration Test", async () => {
    // Polygon mainnet addresses
    const eth2xFliPAddress: Address = "0x3ad707da309f3845cd602059901e39c4dcd66473";
    const wethAmAddress: Address = "0x28424507fefb6f7f8E9D3860F56504E4e5f5f390";
    const usdcAddress: Address = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    const sushiswapFactoryAddress: Address = "0xc35DADB65012eC5796536bD9864eD8773aBc74C4";
    const sushiswapRouterAddress: Address = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
    const wethAddress: Address = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619";
    const daiAddress: Address = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
    const wmaticAddress: Address = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
    const controllerAddress: Address = "0x75FBBDEAfE23a48c0736B2731b956b7a03aDcfB2";
    const debtIssuanceModuleAddress: Address = "0xf2dC2f456b98Af9A6bEEa072AF152a7b0EaA40C9";
    const addressProviderAddress: Address = "0xd05e3E715d945B59290df0ae8eF85c1BdB684744";
    const aaveLeverageModuleAddress: Address = "0xB7F72e15239197021480EB720E1495861A1ABdce";

    let owner: Account;
    let eth2xFli: SetToken;
    let weth: StandardTokenMock;
    let dai: StandardTokenMock;
    let deployer: DeployHelper;
    let sushiRouter: IUniswapV2Router;
    let aaveLeverageModule: ILeverageModule;

    let subjectSetToken: Address;
    let subjectSetAmount: BigNumber;
    let subjectExchange: Exchange;

    before(async () => {
      [owner] = await getAccounts();
      deployer = new DeployHelper(owner.wallet);

      eth2xFli = (await ethers.getContractAt("ISetToken", eth2xFliPAddress)) as SetToken;
      weth = (await ethers.getContractAt("StandardTokenMock", wethAddress)) as StandardTokenMock;
      dai = (await ethers.getContractAt("StandardTokenMock", daiAddress)) as StandardTokenMock;
      aaveLeverageModule = (await ethers.getContractAt(
        "ILeverageModule",
        aaveLeverageModuleAddress,
      )) as ILeverageModule;

      sushiRouter = (await ethers.getContractAt(
        "IUniswapV2Router",
        sushiswapRouterAddress,
      )) as IUniswapV2Router;

      subjectSetToken = eth2xFliPAddress;
      subjectSetAmount = utils.parseEther("100");
      subjectExchange = Exchange.Sushiswap;
    });

    beforeEach(async () => {
      // TODO: Check if we should include this call in the Exchange Issuance contract
      await aaveLeverageModule.sync(eth2xFliPAddress);
    });

    it("fli token should return correct components", async () => {
      const components = await eth2xFli.getComponents();
      expect(components[0]).to.equal(wethAmAddress);
      expect(components[1]).to.equal(usdcAddress);
    });

    context("When exchange issuance is deployed", () => {
      let exchangeIssuance: ExchangeIssuanceLeveraged;
      before(async () => {
        exchangeIssuance = await deployer.extensions.deployExchangeIssuanceLeveraged(
          wmaticAddress,
          wethAddress,
          sushiswapFactoryAddress,
          sushiswapRouterAddress,
          controllerAddress,
          debtIssuanceModuleAddress,
          addressProviderAddress,
        );
        await exchangeIssuance.approveSetToken(eth2xFliPAddress);
      });
      it("verify state set properly via constructor", async () => {
        const expectedWethAddress = await exchangeIssuance.WETH();
        expect(expectedWethAddress).to.eq(utils.getAddress(wmaticAddress));

        const expectedIntermediateAddress = await exchangeIssuance.INTERMEDIATE_TOKEN();
        expect(expectedIntermediateAddress).to.eq(utils.getAddress(wethAddress));

        const expectedSushiRouterAddress = await exchangeIssuance.sushiRouter();
        expect(expectedSushiRouterAddress).to.eq(utils.getAddress(sushiswapRouterAddress));

        const expectedSushiFactoryAddress = await exchangeIssuance.sushiFactory();
        expect(expectedSushiFactoryAddress).to.eq(utils.getAddress(sushiswapFactoryAddress));

        const expectedControllerAddress = await exchangeIssuance.setController();
        expect(expectedControllerAddress).to.eq(utils.getAddress(controllerAddress));

        const expectedDebtIssuanceModuleAddress = await exchangeIssuance.debtIssuanceModule();
        expect(expectedDebtIssuanceModuleAddress).to.eq(
          utils.getAddress(debtIssuanceModuleAddress),
        );
      });
      context("Payment Token: ERC20", () => {
        let pricePaid: BigNumber;
        let inputToken: StandardTokenMock;
        let subjectInputToken: Address;
        context("#issueExactSetForERC20", () => {
          let subjectMaxAmountInput: BigNumber;
          before(async () => {
            const ownerBalance = await owner.wallet.getBalance();
            const ethToSpend = ownerBalance.div(2);
            inputToken = dai;
            subjectInputToken = inputToken.address;
            await sushiRouter.swapExactETHForTokens(
              ZERO,
              [wmaticAddress, subjectInputToken],
              owner.address,
              MAX_UINT_256,
              { value: ethToSpend },
            );
            subjectMaxAmountInput = await inputToken.balanceOf(owner.address);
            await inputToken.approve(exchangeIssuance.address, subjectMaxAmountInput);
          });
          async function subject() {
            return await exchangeIssuance.issueExactSetForERC20(
              subjectSetToken,
              subjectSetAmount,
              subjectInputToken,
              subjectMaxAmountInput,
              subjectExchange,
            );
          }
          it("should update balance correctly", async () => {
            const inputBalanceBefore = await inputToken.balanceOf(owner.address);
            const setBalanceBefore = await eth2xFli.balanceOf(owner.address);
            await subject();
            const setBalanceAfter = await eth2xFli.balanceOf(owner.address);
            const inputBalanceAfter = await inputToken.balanceOf(owner.address);
            pricePaid = inputBalanceBefore.sub(inputBalanceAfter);
            expect(setBalanceAfter.sub(setBalanceBefore)).to.eq(subjectSetAmount);
          });
        });

        context("#redeemExactSetForERC20", () => {
          let subjectMinAmountOutput: BigNumber;
          let outputToken: StandardTokenMock;
          let subjectOutputToken: Address;
          before(async () => {
            // Check to avoid running test when issuance failed and there are no tokens to redeem
            expect(pricePaid.gt(0)).to.be.true;
            subjectMinAmountOutput = pricePaid.div(10);
            eth2xFli.approve(exchangeIssuance.address, subjectSetAmount);
            outputToken = dai;
            subjectOutputToken = outputToken.address;
          });
          async function subject() {
            return await exchangeIssuance.redeemExactSetForERC20(
              subjectSetToken,
              subjectSetAmount,
              subjectOutputToken,
              subjectMinAmountOutput,
              subjectExchange,
            );
          }
          it("should update balance correctly", async () => {
            const outputBalanceBefore = await outputToken.balanceOf(owner.address);
            const setBalanceBefore = await eth2xFli.balanceOf(owner.address);
            expect(setBalanceBefore.gte(subjectSetAmount)).to.be.true;
            await subject();
            const setBalanceAfter = await eth2xFli.balanceOf(owner.address);
            const outputBalanceAfter = await outputToken.balanceOf(owner.address);
            expect(setBalanceBefore.sub(setBalanceAfter)).to.eq(subjectSetAmount);
            expect(outputBalanceAfter.sub(outputBalanceBefore).gte(subjectMinAmountOutput)).to.be
              .true;
          });
        });
      });
      context("Payment Token: ETH", () => {
        let pricePaid: BigNumber;
        context("#issueExactSetForETH", () => {
          let subjectMaxAmountInput: BigNumber;
          before(async () => {
            const ownerBalance = await owner.wallet.getBalance();
            subjectMaxAmountInput = ownerBalance.div(2);
          });
          async function subject() {
            return await exchangeIssuance.issueExactSetForETH(
              subjectSetToken,
              subjectSetAmount,
              subjectExchange,
              { value: subjectMaxAmountInput },
            );
          }
          it("should update balance correctly", async () => {
            const maticBalanceBefore = await owner.wallet.getBalance();
            const setBalanceBefore = await eth2xFli.balanceOf(owner.address);
            await subject();
            const setBalanceAfter = await eth2xFli.balanceOf(owner.address);
            const maticBalanceAfter = await owner.wallet.getBalance();
            pricePaid = maticBalanceBefore.sub(maticBalanceAfter);
            expect(setBalanceAfter.sub(setBalanceBefore)).to.eq(subjectSetAmount);
          });
        });

        context("#redeemExactSetForETH", () => {
          let subjectMinAmountOutput: BigNumber;
          before(async () => {
            // Check to avoid running test when issuance failed and there are no tokens to redeem
            expect(pricePaid.gt(0)).to.be.true;
            subjectMinAmountOutput = pricePaid.div(10);
            eth2xFli.approve(exchangeIssuance.address, subjectSetAmount);
          });
          async function subject() {
            return await exchangeIssuance.redeemExactSetForETH(
              subjectSetToken,
              subjectSetAmount,
              subjectMinAmountOutput,
              subjectExchange,
            );
          }
          it("should update balance correctly", async () => {
            const maticBalanceBefore = await owner.wallet.getBalance();
            const setBalanceBefore = await eth2xFli.balanceOf(owner.address);
            expect(setBalanceBefore.gte(subjectSetAmount)).to.be.true;
            await subject();
            const setBalanceAfter = await eth2xFli.balanceOf(owner.address);
            const maticBalanceAfter = await owner.wallet.getBalance();
            expect(setBalanceBefore.sub(setBalanceAfter)).to.eq(subjectSetAmount);
            expect(maticBalanceAfter.sub(maticBalanceBefore).gte(subjectMinAmountOutput)).to.be
              .true;
          });
        });
      });
      context("Payment Token: LongToken", () => {
        let pricePaid: BigNumber;
        context("#issueExactSetForLongToken", () => {
          let subjectMaxAmountInput: BigNumber;
          before(async () => {
            const ownerBalance = await owner.wallet.getBalance();
            await sushiRouter.swapExactETHForTokens(
              ZERO,
              [wmaticAddress, wethAddress],
              owner.address,
              MAX_UINT_256,
              { value: ownerBalance.div(2) },
            );
            subjectMaxAmountInput = await weth.balanceOf(owner.address);
            await weth.approve(exchangeIssuance.address, subjectMaxAmountInput);
          });
          async function subject() {
            return await exchangeIssuance.issueExactSetForLongToken(
              subjectSetToken,
              subjectSetAmount,
              subjectMaxAmountInput,
              subjectExchange,
            );
          }
          it("should update balance correctly", async () => {
            const wethBalanceBefore = await weth.balanceOf(owner.address);
            const setBalanceBefore = await eth2xFli.balanceOf(owner.address);
            await subject();
            const setBalanceAfter = await eth2xFli.balanceOf(owner.address);
            const wethBalanceAfter = await weth.balanceOf(owner.address);
            pricePaid = wethBalanceBefore.sub(wethBalanceAfter);
            expect(setBalanceAfter.sub(setBalanceBefore)).to.eq(subjectSetAmount);
          });
        });

        context("#redeemExactSetForLongToken", () => {
          let subjectMinAmountOutput: BigNumber;
          before(async () => {
            // Check to avoid running test when issuance failed and there are no tokens to redeem
            expect(pricePaid.gt(0)).to.be.true;
            subjectMinAmountOutput = pricePaid.div(2);
            eth2xFli.approve(exchangeIssuance.address, subjectSetAmount);
          });
          async function subject() {
            return await exchangeIssuance.redeemExactSetForLongToken(
              subjectSetToken,
              subjectSetAmount,
              subjectMinAmountOutput,
              subjectExchange,
            );
          }
          it("should update balance correctly", async () => {
            const wethBalanceBefore = await weth.balanceOf(owner.address);
            const setBalanceBefore = await eth2xFli.balanceOf(owner.address);
            expect(setBalanceBefore.gte(subjectSetAmount)).to.be.true;
            await subject();
            const setBalanceAfter = await eth2xFli.balanceOf(owner.address);
            const wethBalanceAfter = await weth.balanceOf(owner.address);
            expect(setBalanceBefore.sub(setBalanceAfter)).to.eq(subjectSetAmount);
            expect(wethBalanceAfter.sub(wethBalanceBefore).gte(subjectMinAmountOutput)).to.be.true;
          });
        });
      });
    });
  });
}