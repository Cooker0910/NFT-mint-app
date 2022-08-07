import { useEffect, useState } from 'react';
import { ethers, providers } from 'ethers';
import Web3 from 'web3';
import './App.css';
import SlabsAbi from './assets/SlabsAbi.json';
import MonsterAbi from './assets/MonsterAbi.json';

const SLABS = '0x4C74ce8Ec1a16B92a409b7E4d6D1737E36e0558b'
const LABMONSTER = '0xc44C53F5028F9808D868eDf452C9Ff8970299FCE'
const web3 = new Web3(window.ethereum)
const SlabsContract = new web3.eth.Contract(SlabsAbi, SLABS);
const MonsterContract = new web3.eth.Contract(MonsterAbi, LABMONSTER)
const customWeb3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));

let price = 15
let mintPrice = price * 10 ** 18;

function App() {

  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0)
  const [allowance, setAllowance] = useState(0)
  const [userAddress, setUserAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false)

  const chainId = 80001

  const btnhandler = async() => {
  
    // Asking if metamask is already present or not
    if (window.ethereum) {
  
      // res[0] for fetching a first wallet
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async(res) => {
          if(window.ethereum.networkVersion != 80001) changeNetwork();
          console.log(res[0])
          const address = res[0].slice(0, 5) + '...'+ res[0].slice(-4, res[0].length)
          let _balance = await SlabsContract.methods.balanceOf(res[0]).call()
          let _allowance = await SlabsContract.methods.allowance(res[0], LABMONSTER).call();
          let nfts = await MonsterContract.methods.balanceOf(res[0]).call();
          console.log('nfts', nfts)
          setAccount(address);
          setBalance(_balance.toString())
          setAllowance(_allowance.toString())
          setUserAddress(res[0]);
          setIsConnected(true)
        });
    } else {
      alert("install metamask extension!!");
    }

  };

  const addWalletListener = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
        } else {
          setUserAddress("");
        }
      });
    } 
  }
  
  useEffect(() => {
    btnhandler();
    addWalletListener()
  })

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

  const getMintId = async() => {
    try{
      let mintId = await MonsterContract.methods.house(userAddress).call();
      console.log('mint id', mintId)
      try{
        await MonsterContract.methods.ownerOf(mintId).call()
          .then(() => {
            console.log('kkkk')
            getMintId();
          })
          .catch(async(e) => {
            console.log(e.message, typeof e.message)
            if(balance < mintPrice) {
              alert('Not enough SLABS to mint');
              return
            }
            if(allowance < mintPrice) {
              alert('Insufficient SLABS amount of allowance')
              return
            }
            mintNFT(mintId)
          })
          
      } catch(e) {
        console.log(e.message, typeof e.message)
        getMintId()
      }
      
    } catch(e) {
      console.log('1', e.message, typeof e.message)
      await new Promise(resolve => setTimeout(resolve, 10000));
      getMintId();
    }
  }

  const tokenApprove = async() => {
    let res = await SlabsContract.methods.approve(LABMONSTER, ethers.utils.parseEther(price.toString())).send({
      from: userAddress,
      ...gas
    });
    await new Promise(resolve => setTimeout(resolve, 10000));
    return res
  }
  
  const mintNFT = async(id) => {
    let mintRes = await MonsterContract.methods.mint(id).send({
      from: userAddress,
      ...gas
    });
    return mintRes
  }
  
  const mintNow = async() => {
    try{
      let result = await tokenApprove();
      if(result) {
        try{
          await getMintId()
        } catch(e) {
          console.log(e.message, typeof e.message)
        }
      }
    } catch(e) {
      console.log(e.message, typeof e.message)
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
