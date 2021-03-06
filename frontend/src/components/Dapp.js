import React from "react";

// ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";
// contract's artifacts and address
import TodoListArtifact from "../contracts/TodoList.json";
import contractAddress from "../contracts/contract-address.json";
// components
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { List } from "./List";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";
import { Header } from "./Header"

import '../index.css'

const RINKEBY_NETWORK_ID = '4';
// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// the main component which holds the logic for the dapp
export class Dapp extends React.Component {
  
  constructor(props) {
    super(props);
    // this must be bound so the list component can call it
    this._finishItem = this._finishItem.bind(this)
    // the state for the current user
    this.initialState = {
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // the list of tasks
      list: undefined,
      // the text for the title input box
      titleText: "",
      // the amount of ETH in the input box
      amountText: 0,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
    };

    this.state = this.initialState;
  }

  // this function is ran every time by React
  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // ask the user to connect their wallet.
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet 
          connectWallet={() => this._connectWallet()} 
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (!this.state.balance) {
      return <Loading />;
    }
    
    // If everything is loaded, we render the application.
    return (
      <div>
        <Header address={this.state.selectedAddress} balance={this.state.balance.toString()}/>
        <div className="container p-4 main-div">
          <div className="row">
            <div className="col-12">

              {this.state.txBeingSent && (
                <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
              )}

              {this.state.transactionError && (
                <TransactionErrorMessage
                  message={this._getRpcErrorMessage(this.state.transactionError)}
                  dismiss={() => this._dismissTransactionError()}
                />
              )}

            </div>
          </div>

          <div className="row">
            <div className="col-12">
              {/*If the user has no tokens, we show them how to get some */}
              {this.state.balance === "0" && (
                <NoTokensMessage />
              )}
              {/*If a transaction is peneding */}
              {this.state.txBeingSent && <Loading />}
              {/* if the user has ETH and no transaction is currenlty being sent, show the form and the list */}
              {this.state.balance > 0 && !this.state.txBeingSent && (
                <div className="main-card">
                   {this.renderInput()}
                   <List className="todo-list" list={this.state.list} finishFunc={this._finishItem}/>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // return the input boxes for the user to lock funds and add items
  renderInput() {
    if(this.state.txBeingSent) {
      return (
        <div>
          <button>Loading...</button>
        </div>
      );
    } else {
      return (
        <div className="input-div">
          <div className="input-group input-amount-div mb-3">
            {/* if the user has no items in their list show the input to lock funds */}
            {this.state.list.length === 0 && 
              <div class="input-group input-amount-div">
                <div class="input-group-prepend">
                  <span class="input-group-text">Amount To Lock</span>
                </div>
                <input
                  className="input-group-text input-amount"
                  type="number"
                  min="0"
                  step=".1"
                  value={this.state.amountText}
                  onChange={(e) => this.setState({ amountText: e.target.value})}
                />
            </div>  
            }
          </div>

          <div className="input-group">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">Item Title</span>
              </div>
              <input 
                type="text" 
                className="form-control" 
                aria-label="Item Title" 
                aria-describedby="basic-addon2" 
                value={this.state.titleText.toString()} 
                onChange={(e) => this.setState({ titleText: e.target.value.toString() })}
              />
              <div className="input-group-append">
                {/* if the user has no items in their list, disable the add button until they enter funds to lock and the title text */}
                <button className="btn btn-primary" disabled={(this.state.list.length === 0 && this.state.amountText <= 0) || this.state.titleText === ""} onClick={() => this._addItem(this.state.titleText, this.state.amountText.toString())}>
                  Add Item
                </button>
              </div>
            </div>  
          </div>
          {/* if the user does have list items, show the button to finish the list */}
          {this.state.list.length > 0 &&
            <button className="btn btn-outline-danger btn-delete" disabled={!this._checkAllDone()} onClick={() => this._deleteList()}>
              Done with List!
            </button>
          }

        </div>
      );
    }
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp gets unmounted
    this._stopPollingData();
  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // check the network
    if (!this._checkNetwork()) {
      return;
    }
    // initialize the dapp with the address
    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    // `accountsChanged` event can be triggered with an undefined newAddress.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // check if the new address is defined
      if (newAddress === undefined) {
        return this._resetState();
      }
      // initialize the dapp with the new address
      this._initialize(newAddress);
    });
    
    // We reset the dapp state if the network is changed
    window.ethereum.on("chainChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp
    // store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // initialize ethers, fetch the token's data, and start polling for the user's balance.
    this._initializeEthers();
    this._startPollingData();
  }

  async _initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);
    // set the todo list contract
    this._todoList = new ethers.Contract(
      contractAddress.TodoList,
      TodoListArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  _startPollingData() {
    // poll for the users balance every second
    this._pollDataInterval = setInterval(() => this._updateBalance(), 1000);
    // run it once immediately so we don't have to wait for it
    this._updateList();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _updateList() {
    // get the list for the user's address in the contract
    let list = await this._todoList.getList()

    this.setState({ list });
  }

  async _updateBalance() {
    // get the balance of the users wallet
    let balance = await this._provider.getBalance(this.state.selectedAddress)
    balance = ethers.utils.formatEther(balance)
    // update the state with these values
    this.setState({ balance });
  }

  async _finishItem(index) {
    // mark an item as complete in the contract
    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._todoList.finishItem(index);
      this.setState({ txBeingSent: tx.hash });
    
      // wait for the transaction to be mined
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      this._updateList();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  async _addItem(title, amount = "0") {
    // add a task to the users list in the contract
    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._todoList.addItem(title, {
        value: ethers.utils.parseEther(amount)
      });
      this.setState({ txBeingSent: tx.hash });
    
      // wait for the transaction to be mined
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      this._updateList();
      this.setState({ amountText: 0 });
      this.setState({ titleText: "" });
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  async _deleteList() {
    // when the user marks the list as complete send them their locked funds
    try {
      // alert the user if they did not mark every item complete before deleting the list
      if(!this._checkAllDone()) {
        window.alert("You must complete the enitre list to delete it.");
        return;
      }
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._todoList.deleteList();
      this.setState({ txBeingSent: tx.hash });
    
      // wait for the transaction to be mined
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      this._updateList();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }
    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network correct 
  _checkNetwork() {
    if (window.ethereum.networkVersion === RINKEBY_NETWORK_ID) {
      return true;
    }
    // if a different network is selected add the error to the state
    this.setState({ 
      networkError: 'Please connect Metamask to Rinkeby'
    });

    return false;
  }

  // this method verifies all the tasks have been marked as complete
  _checkAllDone() {
    var result = true;
    this.state.list.forEach(function (item) {
      if(item[1] === false) {
        result = false;
      }
    });

    return result;
  }

}
