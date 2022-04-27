// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// test the todoList contract
describe("TodoList contract", function () {
  let owner;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    const TodoList = await ethers.getContractFactory("TodoList");
    [owner] = await ethers.getSigners();
    // deploy the contract
    todoList = await TodoList.deploy();
    // We can interact with the contract by calling `todo.method()`
    await todoList.deployed();
   
  });

});