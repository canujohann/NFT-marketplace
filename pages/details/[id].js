import { ethers } from "ethers";
import Web3 from "web3";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";

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

  const list = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // Get listing price
    const contract = new ethers.Contract(
      nftmarketaddress,
      NFTMarket.abi,
      signer
    );
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    try {
      // Create the marketId
      console.log(
        `values are ${nft.itemId}, price ${price}, and nftaddress is ${nftaddress}`
      );
      transaction = await contract.listMarketItem(
        nft.itemId,
        price,
        nftaddress,
        {
          value: listingPrice,
        }
      );
      await transaction.wait();
    } catch (e) {
      console.log(`content of error is ${e}`);
    }
  };

  async function loadNFT() {
    const web3 = new Web3(window.ethereum);
    //get all accounts
    const appaccounts = await web3.eth.getAccounts();
    setCurrentAccount(appaccounts[0]);
    const networkId = await web3.eth.net.getId();
    const nftData = NFT.networks[networkId];
    const marketData = NFTMarket.networks[networkId];
    if (nftData && marketData) {
      // Token contract interaction
      var abi = NFT.abi;
      var address = nftData.address;
      const tokenContract = new web3.eth.Contract(abi, address);
      // Market contract interaction
      abi = NFTMarket.abi;
      address = marketData.address;
      const marketContract = new web3.eth.Contract(abi, address);
      const itemIDInt = parseInt(id);
      const data = await marketContract.methods
        .fetchItem(parseInt(itemIDInt))
        .call();
      const tokenUri = await tokenContract.methods
        .tokenURI(data.tokenId)
        .call();
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(data.price.toString(), "ether");
      let item = {
        royaltiesPercentage: data.royaltiesPercentage,
        price,
        tokenId: data.tokenId,
        owner: data.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        itemId: data.itemid,
        creator: data.originalCreator,
        tokenId: data.tokenId,
      };
      setNft(item);
      setLoadingState("loaded");
    } else {
      window.alert("smart contract not deployed on selected network");
    }
  }

  return (
    <div className="container">
      <div className="flex flex-row">
        <div className="basis-1/2">
          <div className="w-150 h-150">
            <img className="cursor-pointer shadow-2xl" src={nft.image} />
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
              <TableTd>{nft.creator} </TableTd>
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
