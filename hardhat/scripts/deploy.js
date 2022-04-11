const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  // Get the TODO list contract 
  const todoContract = await ethers.getContractFactory("TODO");
  // use ethers to deploy the contract
  const deployedTodoContract = await todoContract.deploy();
  await deployedTodoContract.deployed();

  // print the address of the deployed contract
  console.log(
      "TODO contract deployed to: ",
      deployedTodoContract.address
  );
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });