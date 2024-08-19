import structuredClone from "@ungap/structured-clone";

export const PRODUCTION_ADDRESSES = {
  tokens: {
    index: "0x0954906da0Bf32d5479e25f46056d22f08464cab",
    stEthAm: "0x28424507fefb6f7f8E9D3860F56504E4e5f5f390",
    stEth: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    dsEth: "0x341c05c0E9b33C0E38d64de76516b2Ce970bB3BE",
    weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    icEth: "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84",
    icReth: "0xe8888Cdbc0A5958C29e7D91DAE44897c7e64F9BC",
    rETH: "0xae78736Cd615f374D3085123A210448E74Fc6393",
    aEthrETH: "0xCc9EE9483f662091a1de4795249E24aC0aC2630f",
    aSTETH: "0x1982b2F5814301d4e9a8b0201555376e62F82428",
    ETH2xFli: "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD",
    cEther: "0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    cUSDC: "0x39aa39c021dfbae8fac545936693ac917d5e7563",
    cDAI: "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",
    fixedDai: "0x015558c3aB97c9e5a9c8c437C71Bb498B2e5afB3",
    wsETH2: "0x5dA21D9e63F1EA13D34e48B7223bcc97e3ecD687",
    rETH2: "0x20BC832ca081b91433ff6c17f85701B6e92486c5",
    sETH2: "0xFe2e637202056d30016725477c5da089Ab0A043A",
    wbtc: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    swETH: "0xf951E335afb289353dc249e82926178EaC7DEd78",
    ETHx: "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b",
    instadappEthV2: "0xa0d3707c569ff8c87fa923d3823ec5d81c98be78",
    pendleEEth0624: "0xc69Ad9baB1dEE23F4605a82b3354F8E40d1E5966",
    pendleRsEth0624: "0xB05cABCd99cf9a73b19805edefC5f67CA5d1895E",
    pendleRswEth0624: "0x5cb12D56F5346a016DBBA8CA90635d82e6D1bcEa",
    pendleEzEth1226: "0xf7906F274c174A52d444175729E3fa98f9bde285",
    pendleEEth0926: "0x1c085195437738d73d75DC64bC5A3E098b7f93b1",
    pendleEEth1226: "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d",
    ezEth: "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110",
    weEth: "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee",
    rsEth: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
    rswEth: "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0",
    acrossWethLP: "0x28F77208728B0A45cAb24c4868334581Fe86F95B",
    morphoRe7WETH: "0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0",
    wstEth: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
    sfrxEth: "0xac3E018457B222d93114458476f3E3416Abbe38F",
    osEth: "0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38",
    comp: "0xc00e94Cb662C3520282E6f5717214004A7f26888",
    dpi: "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b",
  },
  whales: {
    stEth: "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
    dai: "0x075e72a5edf65f0a5f44699c7654c1a76941ddc8",
    weth: "0x2f0b23f53734252bda2277357e97e1517d6b042a",
    USDC: "0x55fe002aeff02f77364de339a1292923a15844b8",
  },
  dexes: {
    curve: {
      calculator: "0xc1DB00a8E5Ef7bfa476395cdbcc98235477cDE4E",
      addressProvider: "0x0000000022D53366457F9d5E68Ec105046FC4383",
      registry: "0x90E00ACe148ca3b23Ac1bC8C240C2a7Dd9c2d7f5",
      ethAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      pools: {
        stEthEth: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
        rEthEth: "0x0f3159811670c117c372428D4E69AC32325e4D0F",
      },
    },
    sushiswap: {
      router: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    },
    uniV2: {
      router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    },
    uniV3: {
      router: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      quoter: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    },
    balancerv2: {
      vault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
    },
    pendle: {
      markets: {
        eEth0624: "0xF32e58F92e60f4b0A37A69b95d642A471365EAe8",
        rsEth0624: "0x4f43c77872db6ba177c270986cd30c3381af37ee",
        rswEth0624: "0xa9355a5d306c67027c54de0e5a72df76befa5694",
        ezEth1226: "0xD8F12bCDE578c653014F27379a6114F67F0e445f",
        eEth0926: "0xC8eDd52D0502Aa8b4D5C77361D4B3D300e8fC81c",
        eEth1226: "0x7d372819240D14fB477f17b964f95F33BeB4c704",
      },
    },
    dexAdapterV2: "0x88858930B3F1946A5C41a5deD7B5335431d5dE8D",
  },
  set: {
    controller: "0xa4c8d221d8BB851f83aadd0223a8900A6921A349",
    basicIssuanceModule: "0xd8EF3cACe8b4907117a45B0b125c68560532F94D",
    debtIssuanceModule: "0x39F024d621367C044BacE2bf0Fb15Fb3612eCB92",
    debtIssuanceModuleV2: "0x69a592D2129415a4A1d1b1E309C17051B7F28d57",
    aaveLeverageModule: "0x251Bd1D42Df1f153D86a5BA2305FaADE4D5f51DC",
    compoundLeverageModule: "0x8d5174eD1dd217e240fDEAa52Eb7f4540b04F419",
    setTokenCreator: "0xeF72D3278dC3Eba6Dc2614965308d1435FFd748a",
  },
  setFork: {
    controller: "0xD2463675a099101E36D85278494268261a66603A",
    debtIssuanceModuleV2: "0xa0a98EB7Af028BE00d04e46e1316808A62a8fd59",
    notionalTradeModule: "0x600d9950c6ecAef98Cc42fa207E92397A6c43416",
    integrationRegistry: "0xb9083dee5e8273E54B9DB4c31bA9d4aB7C6B28d3",
    auctionModuleV1: "0x59D55D53a715b3B4581c52098BCb4075C2941DBa",
    tradeModule: "0xFaAB3F8f3678f68AA0d307B66e71b636F82C28BF",
    airdropModule: "0x09b9e7c7e2daf40fCb286fE6b863e517d5d5c40F",
    aaveV3LeverageStrategyExtension: "0x7d3f7EDD04916F3Cb2bC6740224c636B9AE43200",
    aaveV3LeverageModule: "0x71E932715F5987077ADC5A7aA245f38841E0DcBe",
    constantPriceAdapter: "0x13c33656570092555Bf27Bdf53Ce24482B85D992",
    linearPriceAdapter: "0x237F7BBe0b358415bE84AB6d279D4338C0d026bB",
    setTokenCreator: "0x2758BF6Af0EC63f1710d3d7890e1C263a247B75E",
  },
  lending: {
    aave: {
      addressProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
      lendingPool: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    },
    aaveV3: {
      addressProvider: "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e",
      lendingPool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
    },
    notional: {
      wrappedfCashFactory: "0x5D051DeB5db151C2172dCdCCD42e6A2953E27261",
      notionalV2: "0x1344a36a1b56144c3bc62e7757377d288fde0369",
      nUpgreadableBeacon: "0xFAaF0C5B81E802C231A5249221cfe0B6ae639118",
    },
  },
  oracles: {
    uma: {
      optimisticOracleV3: "0xfb55F43fB9F48F63f9269DB7Dde3BbBe1ebDC0dE",
      identifierWhitelist: "0xcF649d9Da4D1362C4DAEa67573430Bd6f945e570",
    },
  },
};

export const STAGING_ADDRESSES = structuredClone(PRODUCTION_ADDRESSES);

STAGING_ADDRESSES.set = {
  controller: "0xF1B12A7b1f0AF744ED21eEC7d3E891C48Fd3c329",
  debtIssuanceModule: "0x39F024d621367C044BacE2bf0Fb15Fb3612eCB92",
  debtIssuanceModuleV2: "0x3C0CC7624B1c408cF2cF11b3961301949f2F7820",
  aaveLeverageModule: "0x5d2B710787078B45CD7582C0423AC2fC180262e8",
  compoundLeverageModule: "0x8d5174eD1dd217e240fDEAa52Eb7f4540b04F419",
};

STAGING_ADDRESSES.tokens.icEth = "0x219C0C5B42A2DF32782d8F6Bf10eddCD7414CbBf";

export default PRODUCTION_ADDRESSES;
