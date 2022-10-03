import { ethers } from "ethers";
import Web3 from "web3";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from "next/image";
import NftCard from "../Components/NftCard";
import Title from "../Components/Title";

import { nftaddress, nftmarketaddress } from "../config.js";

import NFT from "../build/contracts/NFT.json";
import NFTMarket from "../build/contracts/NFTMarket.json";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const web3 = new Web3(window.ethereum);
    //get all accounts
    const appaccounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();

    const nftData = NFT.networks[networkId];
    const marketData = NFTMarket.networks[networkId];

    if (nftData && marketData) {
      var abi = NFT.abi;
      var address = nftData.address;
      const tokenContract = new web3.eth.Contract(abi, address);

      abi = NFTMarket.abi;
      address = marketData.address;
      const marketContract = new web3.eth.Contract(abi, address);

      const data = await marketContract.methods.fetchMarketItems().call();

      const items = await Promise.all(
        data.map(async (i) => {
          const tokenUri = await tokenContract.methods
            .tokenURI(i.tokenId)
            .call();
          const meta = await axios.get(tokenUri);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            royaltiesPercentage: i.royaltiesPercentage,
            price,
            tokenId: i.tokenId,
            seller: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
          };
          return item;
        })
      );

      setNfts(items);
      setLoadingState("loaded");
    } else {
      window.alert("smart contract not deployed on selected network");
    }
  }

  async function buyNft(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      nftmarketaddress,
      NFTMarket.abi,
      signer
    );

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.tokenId,
      {
        value: price,
      }
    );
    await transaction.wait();
    loadNFTs();
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">Empty Items in Marketplace</h1>;
  return (
    <div className="container">
      <Title>Market</Title>
      <div className="grid grid-cols-4 gap-4 mx-auto">
        {nfts.map((nft, i) => (
          <NftCard
            key={nft.image}
            i={i}
            nft={nft}
            action={buyNft}
            actionName="Buy"
          />
        ))}
      </div>
    </div>
  );
}
