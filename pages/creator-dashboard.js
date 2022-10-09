import { useEffect, useState } from "react";

import { getContracts, getMetaDataAndParseItem } from "../utils/web3Utils";

import SubTitle from "../Components/SubTitle";
import NftCard from "../Components/NftCard";
import Title from "../Components/Title";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const { tokenContract, marketContract } = await getContracts();

    const data = await marketContract.fetchItemsCreated();
    const items = await Promise.all(
      data.map(async (i) => {
        return await getMetaDataAndParseItem(tokenContract, i);
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
