import { ethers } from "ethers";
import Web3 from "web3";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";

import { getContracts, getMetaDataAndParseItem } from "../../utils/web3Utils";

import NftCard from "../../Components/NftCard";
import Title from "../../Components/Title";
import SubTitle from "../../Components/SubTitle";
import NftButton from "../../Components/NftButton";

import { nftaddress, nftmarketaddress } from "../../config.js";

import NFT from "../../build/contracts/NFT.json";
import NFTMarket from "../../build/contracts/NFTMarket.json";

const TableTh = ({ children }) => {
  return <th className="p-2">{children}</th>;
};

const TableTd = ({ children }) => {
  return <td className="p-2">{children}</td>;
};

export default function Details() {
  const [nft, setNft] = useState([]);
  const [price, setPrice] = useState();
  const [currentAccount, setCurrentAccount] = useState();
  const [loadingState, setLoadingState] = useState("not-loaded");

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    loadNFT();
  }, [router.isReady]);

  // List the token on the market
  const list = async () => {
    const { appAccount, tokenContract, marketContract } = await getContracts();

    let listingPrice = await marketContract.getListingPrice();
    listingPrice = listingPrice.toString();
    try {
      // Give the approval to the market to change the owner on his behalf
      const tokenApprovalCall = await tokenContract.giveResaleApproval(
        nft.tokenId
      );
      tokenApprovalCall.wait();

      // List the NFT
      const transaction = await marketContract.listMarketItem(
        nft.itemId,
        ethers.utils.parseUnits(price, "ether"),
        nftaddress,
        {
          value: listingPrice,
        }
      );
      await transaction.wait();
      // Redirect
      router.push("/");
    } catch (e) {
      console.log(`content of error is ${JSON.stringify(e)}`);
    }
  };

  async function loadNFT() {
    const { appAccount, tokenContract, marketContract } = await getContracts();
    setCurrentAccount(appAccount);
    const data = await marketContract.fetchItem(parseInt(parseInt(id)));
    const item = await getMetaDataAndParseItem(tokenContract, data);
    setNft(item);
    setLoadingState("loaded");
  }

  return (
    <div className="container">
      <div className="flex flex-row">
        <div className="basis-1/2">
          <div className="w-150 h-150 p-5">
            <img alt={nft.name} className="shadow-2xl" src={nft.image} />
          </div>
        </div>
        <div className="basis-1/2">
          <table className="table-auto border text-left">
            <tr className="border-b">
              <TableTh>Name</TableTh>
              <TableTd>{nft.name}</TableTd>
            </tr>

            <tr className="border-b">
              <TableTh>Creator</TableTh>
              <TableTd>{nft.originalCreator} </TableTd>
            </tr>

            <tr className="border-b">
              <TableTh>Current owner</TableTh>
              <TableTd>{nft.owner} </TableTd>
            </tr>

            <tr className="border-b">
              <TableTh>Description</TableTh>
              <TableTd>{nft.description}</TableTd>
            </tr>

            <tr className="border-b">
              <TableTh className="p-2">Price</TableTh>
              <TableTd>{nft.price} ETH</TableTd>
            </tr>

            <tr className="border-b">
              <TableTh>Royalties</TableTh>
              <TableTd>{nft.royaltiesPercentage} %</TableTd>
            </tr>

            <tr className="border-b">
              <TableTh>token ID</TableTh>
              <TableTd>{nft.tokenId}</TableTd>
            </tr>
          </table>
          {nft.owner == currentAccount && (
            <>
              <SubTitle>List the token (owner only)</SubTitle>

              <input
                placeholder="NFT Price in Eth"
                className="mt-2 border rounded p-4"
                onChange={(e) => setPrice(e.target.value)}
              />

              <NftButton clickAction={list}>List NFT</NftButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
