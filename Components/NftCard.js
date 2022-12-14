import React from "react";
import Image from "next/image";
import NftButton from "./NftButton";
import Link from "next/link";

const NftCard = ({ nft, action, actionName, i }) => (
  <div key={i} className="border shadow w-96">
    <div style={{ height: "300px" }}>
      <Link passHref href={`/details/${nft.itemId}`}>
        <img
          alt="your NFT"
          className="cursor-pointer"
          src={nft.image}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </Link>
    </div>
    <div className="p-4 bg-zinc-100">
      {/* name */}
      <p className="text-2xl text-center font-bold text-black">{nft.name}</p>
      {/* price*/}
      <p className="text-black text-center">
        <Image alt="ether-logo" src="/ether-logo.svg" width={20} height={20} />
        Price - {nft.price} ETH
        <br />
        royalties: {nft.royaltiesPercentage}%
        <br />
        NFT sold {nft.sold} time(s)
      </p>
      <p className="pt-4 text-center">{nft.description}</p>
      {action && (
        <NftButton clickAction={() => action(nft)}>{actionName}</NftButton>
      )}
    </div>
  </div>
);

export default NftCard;
