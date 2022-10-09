import { useEffect, useState } from "react";
import { nftaddress, nftmarketaddress } from "../config.js";
import SubTitle from "../Components/SubTitle";
import NftCard from "../Components/NftCard";
import Title from "../Components/Title";

import NFT from "../build/contracts/NFT.json";
import NFTMarket from "../build/contracts/NFTMarket.json";
import { getContracts, getMetaDataAndParseItem } from "../utils/web3Utils";

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);

  // Retrieve data directly from the contract
  async function loadNFTs() {
    const { appAccount, tokenContract, marketContract } = await getContracts();
    const data = await marketContract.fetchMyNFTs();
    const items = await Promise.all(
      data.map(async (i) => {
        return await getMetaDataAndParseItem(tokenContract, i);
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  if (loadingState === "loaded" && !nfts.length)
    return <SubTitle>Empty assets owned</SubTitle>;

  return (
    <div className="container">
      <Title>My NFTs </Title>
      <div className="grid grid-cols-4 gap-4 mx-auto">
        {nfts.map((nft, i) => (
          <NftCard key={nft.image} i={i} nft={nft} />
        ))}
      </div>
    </div>
  );
}
