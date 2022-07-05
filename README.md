[![CircleCI](https://dl.circleci.com/status-badge/img/gh/IndexCoop/index-coop-smart-contracts/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/IndexCoop/index-coop-smart-contracts/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/IndexCoop/index-coop-smart-contracts/badge.svg)](https://coveralls.io/github/IndexCoop/index-coop-smart-contracts)

# index

This repo houses the [index-coop][22]'s Solidity smart contracts.

[22]: https://www.indexcoop.com/

## Install (for development)

```
yarn
```

### Run Hardhat EVM

`yarn chain`

### Build Contracts

`yarn compile`

### Generate TypeChain Typings

`yarn build`

### Run Contract Tests

`yarn test` to run compiled contracts

OR `yarn test:clean` if contracts have been typings need to be updated

### Run Coverage Report for Tests

`yarn coverage`

## Installing from `npm`

`index-coop` publishes its contracts as well as [hardhat][22] and [typechain][23] compilation
artifacts to npm.

The distribution comes with fixtures for mocking and testing interactions with other protocols
including Uniswap and Compound. To use these you'll need to install the peer dependencies listed in `package.json`.

```
npm install @indexcoop/index-coop-smart-contracts
```

[22]: https://www.npmjs.com/package/hardhat
[23]: https://www.npmjs.com/package/typechain

## Contributing
We highly encourage participation from the community to help shape the development of Index-Coop. If you are interested in developing on `index-coop` or have any questions, please ping us on [Discord](https://discord.com/invite/RKZ4S3b).

## Security

### TODO: Independent Audits

### Code Coverage

All smart contracts are tested and have 100% line and branch coverage.

### Vulnerability Disclosure Policy

The disclosure of security vulnerabilities helps us ensure the security of our users.

**How to report a security vulnerability?**

If you believe you’ve found a security vulnerability in one of our contracts or platforms,
send it to us by emailing [security@indexcoop.com](mailto:security@indexcoop.com).
Please include the following details with your report:

* A description of the location and potential impact of the vulnerability.

* A detailed description of the steps required to reproduce the vulnerability.

**Scope**

Any vulnerability not previously disclosed by us or our independent auditors in their reports.

**Guidelines**

We require that all reporters:

* Make every effort to avoid privacy violations, degradation of user experience,
disruption to production systems, and destruction of data during security testing.

* Use the identified communication channels to report vulnerability information to us.

* Keep information about any vulnerabilities you’ve discovered confidential between yourself and
Set until we’ve had 30 days to resolve the issue.

If you follow these guidelines when reporting an issue to us, we commit to:

* Not pursue or support any legal action related to your findings.

* Work with you to understand and resolve the issue quickly
(including an initial confirmation of your report within 72 hours of submission).

* Grant a monetary reward based on the OWASP risk assessment methodology.
