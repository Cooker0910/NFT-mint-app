import { useState } from 'react';
import { ethers, providers } from 'ethers';
import Web3 from 'web3';
import './App.css';

function App() {

  const [account, setAccount] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false)

  const customWeb3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));
  const chainId = 80001
  const web3Provider = '';

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

  return (
    <div className="App">
      <p>LAB MONSTERS created by Starter Labs</p>
      {isConnected ? 
        <button onClick={btnhandler}>{account}</button>
        :
        <button onClick={btnhandler}>Connect Wallet</button>
      }
      <button>Mint Now</button>
    </div>
  );
}

export default App;
