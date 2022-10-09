import { useState } from "react";
import { ethers } from "ethers";

import { useRouter } from "next/router";
import Web3Modal from "web3modal";
import NftButton from "../Components/NftButton";
import Title from "../Components/Title";

import { nftaddress, nftmarketaddress } from "../config.js";
import NFT from "../build/contracts/NFT.json";
import NFTMarket from "../build/contracts/NFTMarket.json";

import {
  getContracts,
  getMetaDataAndParseItem,
  getIPFSClient,
} from "../utils/web3Utils";

// IPFS related
const privateGatewayIpfs = process.env.NEXT_PUBLIC_INFURA_IPFS_PRIVATE_GATEWAY;
const client = getIPFSClient();

//
export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
    royalties: "",
  });
  const router = useRouter();

  // Upload on IPFS
  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `${privateGatewayIpfs}/${added.path}`;
      setFileUrl(url);
    } catch (e) {
      console.log(e);
    }
  }
  async function createItem() {
    const { name, description, price, royalties } = formInput;

    // Basic data validation
    if (
      !name ||
      !description ||
      !price ||
      !fileUrl ||
      !royalties ||
      parseInt(royalties) > 15 ||
      parseInt(royalties) < 0
    ) {
      alert("please input all fields !");
      return;
    }

    // Prepare data to save in IPFS
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      // Update metadata on IPFS
      const added = await client.add(data);
      const url = `${privateGatewayIpfs}/${added.path}`;

      // Mint the NFT
      createSale(url);
    } catch (e) {
      alert(e);
      console.log(e);
    }
  }
  async function createSale(url) {
    try {
      const { appAccount, tokenContract, marketContract } =
        await getContracts();

      // Create first a token on NFT contract
      let transaction = await tokenContract.createToken(url);
      let tx = await transaction.wait();
      let event = tx.events[0];
      let value = event.args[2];

      let tokenId = value.toNumber();
      const price = ethers.utils.parseUnits(formInput.price, "ether");
      const royalties = parseInt(formInput.royalties, 10);

      // Get listing price
      let listingPrice = await marketContract.getListingPrice();
      listingPrice = listingPrice.toString();

      // Create the marketId
      transaction = await marketContract.createMarketItem(
        nftaddress,
        tokenId,
        price,
        royalties,
        {
          value: listingPrice,
        }
      );
      await transaction.wait();

      // Redirect
      router.push("/");
    } catch (e) {
      console.log(`content of error is ${e}`);
    }
  }
  return (
    <div className="container">
      <Title>Mint your NFT !</Title>
      <div className="flex justify-center">
        <div className="w-1/2 flex flex-col pb-12">
          <input
            placeholder=" NFT Name"
            className="mt-8 border rounded p-4"
            onChange={(e) =>
              updateFormInput({ ...formInput, name: e.target.value })
            }
          />
          <textarea
            placeholder="NFT Description"
            className="mt-8 border rounded p-4"
            onChange={(e) =>
              updateFormInput({ ...formInput, description: e.target.value })
            }
          />
          <input
            placeholder="NFT Price in Eth"
            className="mt-2 border rounded p-4"
            onChange={(e) =>
              updateFormInput({ ...formInput, price: e.target.value })
            }
          />

          <input
            placeholder="Royalties in %  (between 0 and 15)"
            className="mt-2 border rounded p-4"
            onChange={(e) =>
              updateFormInput({ ...formInput, royalties: e.target.value })
            }
          />

          <input
            type="file"
            name="Asset"
            className="my-4"
            onChange={onChange}
          />
          {fileUrl && (
            <img
              alt="your-nft"
              className="rounded mt-4 "
              width="350"
              src={fileUrl}
            />
          )}

          <NftButton clickAction={createItem}>Create NFT</NftButton>
        </div>
      </div>
    </div>
  );
}
