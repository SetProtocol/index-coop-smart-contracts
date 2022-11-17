import "module-alias/register";

import { Address, Account } from "@utils/types";
import { ADDRESS_ZERO, MAX_UINT_256 } from "@utils/constants";
import { AirdropExtension, BaseManagerV2 } from "@utils/contracts/index";
import { SetToken } from "@utils/contracts/setV2";
import DeployHelper from "@utils/deploys";
import {
  addSnapshotBeforeRestoreAfterEach,
  ether,
  getAccounts,
  getSetFixture,
  getWaffleExpect,
} from "@utils/index";
import { SetFixture } from "@utils/fixtures";
// import { BigNumber, ContractTransaction } from "ethers";
// import { StakeWiseReinvestmentExtension } from "@typechain/StakeWiseReinvestmentExtension";

const expect = getWaffleExpect();

if (process.env.INTEGRATIONTEST) {
  describe("StakeWiseReinvestmentExtension", () => {
    let owner: Account;
    // let allowedCaller: Account;

    let setV2Setup: SetFixture;

    // let extension: StakeWiseReinvestmentExtension;

    let deployer: DeployHelper;
    let setToken: SetToken;

    let baseManagerV2: BaseManagerV2;

    before(async () => {
      [
        owner,
        // allowedCaller,
      ] = await getAccounts();

      deployer = new DeployHelper(owner.wallet);

      setV2Setup = getSetFixture(owner.address);
      await setV2Setup.initialize();


      setToken = await setV2Setup.createSetToken(
        [setV2Setup.dai.address],
        [ether(100)],
        [setV2Setup.airdropModule.address, setV2Setup.issuanceModule.address]
      );

      await setV2Setup.issuanceModule.initialize(
        setToken.address,
        ADDRESS_ZERO
      );

      // Issue some set tokens
      await setV2Setup.dai.approve(setV2Setup.issuanceModule.address, MAX_UINT_256);
      await setV2Setup.issuanceModule.issue(setToken.address, ether(5), owner.address);

      // Deploy BaseManager
      baseManagerV2 = await deployer.manager.deployBaseManagerV2(
        setToken.address,
        owner.address,
        owner.address,
      );
      await baseManagerV2.connect(owner.wallet).authorizeInitialization();
    });

    addSnapshotBeforeRestoreAfterEach();

    describe("#constructor", async () => {
      let subjectManager: Address;
      let subjectAirdropModule: Address;

      beforeEach(async () => {
        subjectManager = baseManagerV2.address;
        subjectAirdropModule = setV2Setup.airdropModule.address;
      });

      async function subject(): Promise<AirdropExtension> {
        return await deployer.extensions.deployAirdropExtension(
          subjectManager,
          subjectAirdropModule
        );
      }

      it("should set the correct set token address", async () => {
        const airdropExtension = await subject();

        const actualSetToken = await airdropExtension.setToken();
        expect(actualSetToken).to.eq(setToken.address);
      });

      it("should set the correct manager address", async () => {
        const airdropExtension = await subject();

        const manager = await airdropExtension.manager();
        expect(manager).to.eq(subjectManager);
      });

      it("should set the correct airdrop module address", async () => {
        const airdropExtension = await subject();

        const airdropModule = await airdropExtension.airdropModule();
        expect(airdropModule).to.eq(subjectAirdropModule);
      });
    });
});
}
