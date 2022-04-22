// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// test the todoList contract
describe("TodoList contract", function () {
  let owner;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    TodoList = await ethers.getContractFactory("TodoList");
    [owner] = await ethers.getSigners();
    // deploy the contract
    todoList = await TodoList.deploy();
    // We can interact with the contract by calling `todo.method()`
    await todoList.deployed();
    // send the contract 5 ETH from the owner' account
    await owner.sendTransaction({
        to: todoList.address,
        value: ethers.utils.parseEther("5.0"), 
    });
  });

  // test the deplyment of the contract
  describe("Deployment", function () {
    // make sure the owner is set to the deployer of the contract
    it("Should set the correct owner", async function () {
        // This test expects the owner variable stored in the contract to be equal to our Signer's owner.
        expect(await todoList.owner()).to.equal(owner.address);
    });
  });

  // test the functions in the contract
  describe("Transactions", function () {
   
  });
});