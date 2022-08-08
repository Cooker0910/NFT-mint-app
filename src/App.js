import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3 from 'web3';
import './App.css';
import NftDetails from './Components/NFT';
import SlabsAbi from './assets/SlabsAbi.json';
import MonsterAbi from './assets/MonsterAbi.json';

const SLABS = '0x4C74ce8Ec1a16B92a409b7E4d6D1737E36e0558b'
const LABMONSTER = '0xc44C53F5028F9808D868eDf452C9Ff8970299FCE'
const web3 = new Web3(window.ethereum)
const SlabsContract = new web3.eth.Contract(SlabsAbi, SLABS);
const MonsterContract = new web3.eth.Contract(MonsterAbi, LABMONSTER)
const customWeb3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));

const chainId = 80001
let price = 15
let mintPrice = price * 10 ** 18;
const gas = {
  gasPrice: ethers.utils.parseUnits('100', 'gwei'),
  gasLimit: 1100000
}

const App =() => {

  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0)
  const [userAddress, setUserAddress] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [cnt, setCnt] = useState(0)

  const btnhandler = async () => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then(async (res) => {
          if (window.ethereum.networkVersion !== 80001) changeNetwork();
          console.log(res[0])
          const address = res[0].slice(0, 5) + '...' + res[0].slice(-4, res[0].length)
          let _balance = await SlabsContract.methods.balanceOf(res[0]).call()
          let nfts = await MonsterContract.methods.balanceOf(res[0]).call();
          setCnt(nfts)
          setAccount(address);
          setBalance(_balance.toString())
          setUserAddress(res[0]);
          setIsConnected(true)
        })
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

  const changeNetwork = async () => {
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

  const getMintId = async () => {
    MonsterContract.methods.house(userAddress).call()
      .then((mintId) => {
        console.log('mint id', mintId)
        MonsterContract.methods.ownerOf(mintId).call()
          .then(() => {
            getMintId();
          })
          .catch(async (e) => {
            let _allowance = await SlabsContract.methods.allowance(userAddress, LABMONSTER).call();
            if (balance < mintPrice) {
              alert('Not enough SLABS to mint');
              return
            }
            console.log('allowance', typeof _allowance, _allowance)
            if (_allowance.toString() < mintPrice) {
              alert('Insufficient SLABS amount of allowance')
              return
            }
            mintNFT(mintId)
          })
      })
      .catch(async(e) => {
        console.log('get mint id err', e)
        await new Promise(resolve => setTimeout(resolve, 10000));
        getMintId()
      }) 
  }

  const mintNFT = async (id) => {
    let mintRes = await MonsterContract.methods.mint(id).send({
      from: userAddress,
      ...gas
    });
    console.log('mint res', mintRes)
    return mintRes
  }

  const mintNow = async () => {
    SlabsContract.methods.approve(LABMONSTER, ethers.utils.parseEther(price.toString()))
      .send({
        from: userAddress,
        ...gas
      })
      .then((res) => {
        getMintId()
      })
      .catch((e) => {
        console.log('approve err', e)
      })
  }

  useEffect(() => {
    btnhandler();
  }, [])
  return (
    <>
      <div className="App">
        <p>LAB MONSTERS created by Starter Labs</p>
        {isConnected ?
          <a href={'https://mumbai.polygonscan.com/address/' + userAddress} target="_blank" className="address">{account}</a>
          :
          <button onClick={btnhandler}>Connect Wallet</button>
        }
        <button onClick={mintNow}>Mint Now</button>
      </div>
      <div className='nfts'>
        {
          [...new Array(Number(cnt))].map((item, index) => {
            return (
              <NftDetails 
                id = {index}
                key={index}
                address = {userAddress}
              />
            )
          })
        }
      </div>
    </>
  );
}

export default App;
