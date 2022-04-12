import { Contract, providers, utils } from "ethers";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import {
  TODO_CONTRACT_ABI,
  TODO_CONTRACT_ADDRESS,
} from "./constants";
import styles from "./App.css";
import List from "./components/List";

function App() {

  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [titleText, setTitleText] = useState("");
  const [amountText, setAmountText] = useState("0");

  const web3ModalRef = useRef();

  const addItemToList = async (title, amount = "0") => {
    try {
      const signer = await getProviderOrSigner(true);
      // Create an instance of todoContract
      const todoContract = new Contract(
        TODO_CONTRACT_ADDRESS,
        TODO_CONTRACT_ABI,
        signer
      );
      
      const tx = await todoContract.addItem(title, {
        // value signifies the cost of one crypto dev token which is "0.001" eth.
        // We are parsing `0.001` string to ether using the utils library from ethers.js
        value: utils.parseEther(amount),
      });
      setAmountText("0");
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      await getList();
      //await getList();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItemFromList = async (id) => {
    console.log("delete");
    try {
      const signer = await getProviderOrSigner(true);
      // Create an instance of todoContract
      const todoContract = new Contract(
        TODO_CONTRACT_ADDRESS,
        TODO_CONTRACT_ABI,
        signer
      );
      
      const tx = await todoContract.finishItem(0);
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      await getList();
      //await getList();
    } catch (err) {
      console.error(err);
    }
  };

  const getList = async () => {
    try {
      console.log("list: " + list.toString);
      const provider = await getProviderOrSigner();
      const todoContract = new Contract(
        TODO_CONTRACT_ADDRESS,
        TODO_CONTRACT_ABI,
        provider
      );

      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();

      const items = await todoContract.getList(address);
      
      console.log(items);
      setList(items);
    } catch (err) {
      console.error(err);
    }
  }

  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Rinkeby network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  /*
    connectWallet: Connects the MetaMask wallet
  */
  const connectWallet = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // When used for the first time, it prompts the user to connect their wallet
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };
    
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      getList();
    }
  }, [walletConnected]);


  const renderInput = () => {
    if(loading) {
      return (
        <div>
          <button>Loading...</button>
        </div>
      );
    } else {
      return (
        <div style={{ display: "flex-col" }}>
          <div>
            <input
              type="text"
              placeholder="Item Title"
              onChange={(e) => setTitleText(e.target.value.toString())}
              className={styles.input}
            />
            {(list.length === 0) && 
              <input
                type="text"
                placeholder="Amount To Lock"
                onChange={(e) => setAmountText(e.target.value.toString())}
                className={styles.input}
              />
            }
          </div>
          <button onClick={() => addItemToList(titleText, amountText)}>
            Add Item
          </button>
        </div>
      );
    }
  }


  return (
    <div>
      <div>
        <title>TODO List</title>
        <meta name="description" content="TODO-Dapp" />
      </div>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Your Blockchain TODO List</h1>
          <div className={styles.description}>
            Lock up your funds until you complete every task on your list
          </div>
          {walletConnected ? (
            <div>
              {renderInput()}
              <p>{list}</p>
              <List list={list} deleteFunc={removeItemFromList}/>
            </div>
          ) : (
            <button onClick={connectWallet} className={styles.button}>
              Connect your wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
