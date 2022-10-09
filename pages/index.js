import { useEffect, useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";

import NftCard from "../Components/NftCard";
import Title from "../Components/Title";
import { getContracts, getMetaDataAndParseItem } from "../utils/web3Utils";

import { nftaddress, nftmarketaddress } from "../config.js";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [account, setAccount] = useState("");
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  // Load all the listed NFT
  async function loadNFTs() {
    const { appAccount, tokenContract, marketContract } = await getContracts();

    if (appAccount) {
      setAccount(appAccount);
      const data = await marketContract.fetchMarketItems();
      const items = await Promise.all(
        data.map(async (i) => {
          return await getMetaDataAndParseItem(tokenContract, i);
        })
      );
      setNfts(items);
      setLoadingState("loaded");
    } else {
      window.alert("Semething goes wrong !");
    }
  }

  // Buy an NFT in clicking on "BUY"
  async function buyNft(nft) {
    const { marketContract } = await getContracts();
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await marketContract.createMarketSale(
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
          <>
            {nft.seller === account && (
              <NftCard key={nft.image} i={i} nft={nft} />
            )}
            {nft.seller !== account && (
              <NftCard
                key={nft.image}
                i={i}
                nft={nft}
                action={buyNft}
                actionName="Buy"
              />
            )}
          </>
        ))}
      </div>
    </div>
  );
}
