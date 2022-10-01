import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../config.js";
import SubTitle from "../Components/SubTitle";
import NftCard from "../Components/NftCard";
import Title from "../Components/Title";

import NFT from "../build/contracts/NFT.json";
import NFTMarket from "../build/contracts/NFTMarket.json";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      NFTMarket.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchItemsCreated();
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    const soldItems = items.filter((i) => i.sold);
    setSold(soldItems);
    setNfts(items);
    setLoadingState("loaded");
  }
  return (
    <div className="container">
      <Title>Dashboard</Title>
      {/* Items created */}
      <SubTitle>Items Created</SubTitle>
      <div className="grid grid-cols-4 gap-4 mx-auto">
        {nfts.map((nft, i) => (
          <NftCard key={nft.image} i={i} nft={nft} />
        ))}
      </div>

      {/* Items sold */}
      {Boolean(sold.length) && (
        <>
          <SubTitle>Items Sold</SubTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {sold.map((nft, i) => (
              <NftCard key={nft.image} i={i} nft={nft} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
