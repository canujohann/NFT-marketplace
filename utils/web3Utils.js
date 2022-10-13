import axios from "axios";

import Web3 from "web3";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { create as ipfsHttpClient } from "ipfs-http-client";

import { nftaddress, nftmarketaddress } from "../config.js";

import NFT from "../build/contracts/NFT.json";
import NFTMarket from "../build/contracts/NFTMarket.json";

export const getContracts = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();

  // TODO change to that later
  // const provider = new ethers.providers.Web3Provider(window.ethereum)
  const provider = new ethers.providers.Web3Provider(connection);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();

  const appAccount = await signer.getAddress();

  const marketContract = new ethers.Contract(
    nftmarketaddress,
    NFTMarket.abi,
    signer
  );
  const tokenContract = new ethers.Contract(nftaddress, NFT.abi, signer);

  return { appAccount, marketContract, tokenContract };
};

export const getMetaDataAndParseItem = async (tokenContract, itemMarket) => {
  const tokenUri = await tokenContract.tokenURI(itemMarket.tokenId);
  const meta = await axios.get(tokenUri);
  let price = ethers.utils.formatUnits(itemMarket.price.toString(), "ether");
  return {
    royaltiesPercentage: itemMarket.royaltiesPercentage,
    price,
    sold: itemMarket.sold.toString(),
    tokenId: itemMarket.tokenId.toString(),
    seller: itemMarket.seller,
    owner: itemMarket.owner,
    originalCreator: itemMarket.originalCreator,
    image: meta.data.image,
    name: meta.data.name,
    description: meta.data.description,
    itemId: itemMarket.itemid.toString(),
  };
};

export const getIPFSClient = () => {
  const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID;
  const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET;
  const auth =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

  const client = ipfsHttpClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    apiPath: "/api/v0",
    headers: {
      authorization: auth,
    },
  });
  return client;
};
