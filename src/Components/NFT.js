import { useEffect, useState } from "react";
import Web3 from 'web3'
import MonsterAbi from '../assets/MonsterAbi.json';

const LABMONSTER = '0xc44C53F5028F9808D868eDf452C9Ff8970299FCE'
const web3 = new Web3(window.ethereum)
const MonsterContract = new web3.eth.Contract(MonsterAbi, LABMONSTER)

const NftDetails = (props) => {
  const [details, setDetails] = useState({});
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      await MonsterContract.methods.tokenOfOwnerByIndex(props.address, props.id).call().then(async(tokenId) => {
        await MonsterContract.methods.tokenURI(tokenId).call()
          .then(async (tokenURI) => {
            var url = 'https://ipfs.io/ipfs/' + tokenURI.slice(6, tokenURI.length);
            const data = await fetch(url);
            const json = await data.json();
            json.image = 'https://ipfs.io/ipfs/' + json.image.slice(6, json.image.length);
            json.tokenId = tokenId;
            setDetails(json)
            setConfirm(true)
          })
      })
    }
    fetchData()
  }, [props.id]);

  return (
    <>
      {confirm ?
        <a href={'https://testnets.opensea.io/assets/mumbai/' + LABMONSTER + '/' + details.tokenId} target='_blank' className='nft'>
          <div>
            <img src={details.image} alt={details.name} />
          </div>
          <p>Level: {details.properties.level}</p>
        </a>
        :
        <></>
      }
    </>
  );
}

export default NftDetails;