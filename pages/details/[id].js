import { ethers } from "ethers";
import Web3 from "web3";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Image from "next/image";
import { useRouter } from "next/router";

import NftCard from "../../Components/NftCard";
import Title from "../../Components/Title";
import SubTitle from "../../Components/SubTitle";
import NftButton from "../../Components/NftButton";

import { nftaddress, nftmarketaddress } from "../../config.js";

import NFT from "../../build/contracts/NFT.json";
import NFTMarket from "../../build/contracts/NFTMarket.json";

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
        seller: data.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        itemId: data.itemid,
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
          <NftCard nft={nft} />
        </div>
        <div className="basis-1/2">
          {nft.seller == currentAccount && (
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
