# About this project

This project is a a NFT marketplace for the blockchains Ethereum / Polygon. You can easily customize it and deploy it as a real market on your favorite blockchain !

![top](/docs/top.png)

# Technology stack

- React (Nextjs)
- Tailwind
- Solidity (0.8.11)
- ethers.js
- MetaMask
- Truffle
- Infura (IPFS)
- Ganache (only needed if you want to test locally your contract)

# Features

## Get all the listed NFT

Your browser will retrieve all the NFT through metamask, and metatada (from IPFS). This flow is used on the top page, and for th dashboard, and the "my NFT" page.

```mermaid
sequenceDiagram

  participant Browser
  participant Market Contract
  participant IPFS

  Note over Browser,IPFS: Step 1: Get all data from the market Contract
  Browser->>Market Contract: Call the `fetchMarketItems()` or `fetchItemsCreated()` methods
  Market Contract-->>Browser: Retrieve all the Market NFT basic info
  Note over Browser,IPFS: Step 2: Loop all object and retrieve their metadata on IPFS
  loop Metadata
    Browser->>IPFS: Call IPFS with the NFT ID as key
    IPFS->>Browser: Retrieve the metadata
  end

```

## Mint an NFT

When minting a Token (2 different contract need to be called)

```mermaid
sequenceDiagram

participant Browser
participant NFT Contract
participant Market Contract
participant IPFS

Note over Browser,IPFS: Step 1: store the image on IPFS
Browser->>IPFS: Send image
IPFS-->>Browser: Retrieve the image hash
Note over Browser,IPFS: Step 2: store the metadata on IPFS
Browser->>IPFS: Send metadata (including image hash)
IPFS->>Browser: Retrieve the metadata hash
Note over Browser,IPFS: Step 3: Create the token
Browser->>NFT Contract: Call the `createToken()` method
NFT Contract->>Browser: Return an uniq ID
Note over Browser,IPFS: Step 4: Get the listing price from the Market Contract
Browser->>NFT Contract: Call the `getListingPrice()` method
NFT Contract->>Browser: Return the listing price
Note over Browser,IPFS: Step 5: Create the Market item
Browser->>Market Contract: Create the Item in Market with  `createMarketItem()`
Market Contract->>Browser: Did not return anything
```

## Buy an NFT

When buying an NFT from the top page (owner cannot buy their own NFT)

```mermaid
sequenceDiagram

participant Browser
participant Market Contract

Note over Browser,Market Contract: Step 1: Change the ownership of the NFT
Browser->>Market Contract: call the `createMarketSale()` method
Market Contract-->>Browser: Do not return anything
```

## Re-sell an NFT

When re-selling an NFT after purchasing it.

```mermaid
sequenceDiagram

participant Browser
participant NFT Contract
participant Market Contract

Note over Browser,Market Contract: Step 1: Get the listing price from the Market Contract
Browser->>NFT Contract: Call the `getListingPrice()` method
NFT Contract->>Browser: Return the listing price
Note over Browser,Market Contract: Step 2: Set the approval for the market to sell on the behalf of the owner
Browser->>NFT Contract: Call the `giveResaleApproval()` method
NFT Contract->>Browser: Do not return anything
Note over Browser,Market Contract: Step 3: Update the market (owner, price, etc.)
Browser->>Market Contract: update the Item in Market with  `listMarketItem()`
Market Contract->>Browser: Did not return anything
```

# Getting Started

## Smart contract (Backend)

Contracts are available under the `contracts` folder. Update the `truffle-config` file with your own blockchain networks. `Localhost` is already set (port 7545) and will work out of the box.

- Start Ganache (if localhost)
- Create a **.secret** file that contains your ganache seedphrase
- Deploy the contract :

```
npm install
truffle deploy --network development
```

- Save your 2 contracts addresses in `.env.local` :

```
NEXT_PUBLIC_MARKET_ADDRESS="0xE6Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
NEXT_PUBLIC_NFT_ADDRESS="0xE6Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
```

> You can easily retrieve your contract addresses in connecting ganache to your `truffle-config.js` file (see capture)

![ganache truffle connection](/docs/ganache-truffle.png)

- Create an IPFS account on Infura and update your `.env.local` as below :

```
NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID="xxxxx"
NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET="yyyyy"
NEXT_PUBLIC_INFURA_IPFS_PRIVATE_GATEWAY="https://your-account.infura-ipfs.io/ipfs"
```

## Frontend

run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Next step

You can create PR to enhance it :

- Component refactoring (react)
- Smart contract enhancement
- etc.
