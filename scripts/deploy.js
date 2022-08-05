// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const SLABS = await hre.ethers.getContractFactory("SLABS");
  const sLabs = await SLABS.deploy('Starter Labs', 'SLABS');

  await sLabs.deployed();

  console.log("SLABS deployed to:", sLabs.address);

  const LABMONSTER = await hre.ethers.getContractFactory('LabMonster');
  const labMonster = await LABMONSTER.deploy(1305, 'QmZWzAUMs8G7Bp9a1w8Kawu8UR71d5mipkyD9f49hsgHm3', sLabs.address, 15)

  await labMonster.deployed();

  console.log('LAB MONSTER deployed to:', labMonster.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
