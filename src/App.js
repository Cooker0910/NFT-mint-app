import { useState } from 'react';
import { ethers, providers } from 'ethers';
import Web3 from 'web3';
import './App.css';
import SlabsAbi from './assets/SlabsAbi.json';
import MonsterAbi from './assets/MonsterAbi.json';

const SLABS = '0x383474C4532e1028327E1e5a75a6A480C775D9E3'
const LABMONSTER = '0x7f0e3Fa937657D45e3848b5710962F9b7A1A5B1E'
const web3 = new Web3(window.ethereum)
const SlabsContract = new web3.eth.Contract(SlabsAbi, SLABS);
const MonsterContract = new web3.eth.Contract(MonsterAbi, LABMONSTER)

function App() {

  const [account, setAccount] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false)

  const customWeb3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));
  const chainId = 80001

  const btnhandler = async() => {
  
    // Asking if metamask is already present or not
    if (window.ethereum) {
  
      // res[0] for fetching a first wallet
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => {
          if(window.ethereum.networkVersion != 80001) changeNetwork();
          const user_address =res[0]
          console.log(user_address)
          const address = user_address.slice(0, 5) + '...'+ user_address.slice(-4, user_address.length)
          setAccount(address);
          setUserAddress(user_address);
          setIsConnected(true)
        });
    } else {
      alert("install metamask extension!!");
    }

  };

  const changeNetwork = async() => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: customWeb3.utils.toHex(chainId) }]
      });
    } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainName: 'Mumbai',
              chainId: customWeb3.utils.toHex(chainId),
              nativeCurrency: { name: 'tMATIC', decimals: 18, symbol: 'tMATIC' },
              rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
              blockExplorerUrls: ['https://mumbai.polygonscan.com/']
            },
          ]
        });
      }
    }
  }

  const gas = {
    gasPrice: ethers.utils.parseUnits('100', 'gwei'),
    gasLimit: 1100000
  }
  
  const mintNow = async() => {
    try{
      // let res = await SlabsContract.methods.approve(LABMONSTER, 10000).send({from: userAddress});
      // if(res) {
        let rollDice = await MonsterContract.methods.rollDice().send({
          from: userAddress,
          ...gas
        });
        console.log('roll dice', rollDice)
        if(rollDice) {
          let house = await MonsterContract.methods.house(userAddress).call()
          console.log('house', house)

        }
      // }
      // console.log(res)
    } catch(e) {
      console.log("error", e)
    }
  }

  return (
    <div className="App">
      <p>LAB MONSTERS created by Starter Labs</p>
      {isConnected ? 
        <button onClick={btnhandler}>{account}</button>
        :
        <button onClick={btnhandler}>Connect Wallet</button>
      }
      <button onClick={mintNow}>Mint Now</button>
    </div>
  );
}

export default App;
