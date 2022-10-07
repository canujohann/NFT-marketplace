// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    // counter for item IDs
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold; //TODO to remove

    // Owner of the marketplace (Receives the listing fees)
    address payable owner;

    // Fees to pay to the `owner` of the marketplace for listing an NFT
    uint256 listingPrice = 0.050 ether;

    // User who deploy the contract is the owner of the market
    constructor() {
        owner = payable(msg.sender);
    }

    // NFT item information
    // Both `seller` and `owner` are needed when doing a listing (owner is set to "0" )
    // Original creator is needed for the royalties
    struct MarketItem {
        uint256 itemid;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        uint256 sold;
        uint8 royaltiesPercentage;
        address payable originalCreator;
    }

    // Items in the market (listed or not)
    // The key is the itemId
    mapping(uint256 => MarketItem) private idToMarketItem;

    // Event for a new NFT creation
    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        uint256 sold,
        uint8 royaltiesPercentage,
        address originalCreator
    );

    // Event when an existing NFT is re-listed
    event MarketItemRelisted(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price
    );

    /* Returns the listing price of the contract 
        TODO check is we really need this method. it should be reachable directly
    */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* 
        Mint an item and list it on the marketplace.
        As a prerequisite, NFT has to be registered in the NTF contract.
        @param nftContract : address of the NFT contract
        @param tokenId: TokenId in the NFT contract
        @param price: Price for the NFT
        @param royaltiesPercentage: royalties percentage to be giving to the original creator
    */
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint8 royaltiesPercentage
    ) public payable nonReentrant {
        // Price of the NFT has to be more than 1 wei
        require(price > 0, "Price must be at least 1 wei");

        // Value of the transaction should be the same than the listing price
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        // Royalties should be under 15%
        require(
            royaltiesPercentage <= 15,
            "Please submit a royalties under 15%"
        );

        // Generate a new uniq id
        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        // Update the Market contract
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            0,
            royaltiesPercentage,
            payable(msg.sender)
        );

        // Update the ownership in FNT contract (from creator to the market contract address)
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        // Emit an event about the item creation
        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            0,
            royaltiesPercentage,
            msg.sender
        );
    }

    /* 
        When an item is bought on the marketplace.
        @param nftContract : address of the NFT contract
        @param itemId: itemID in the Market contract
    */
    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        // Retrieve the price + royalties information
        uint256 price = idToMarketItem[itemId].price;
        uint8 royaltiesPercentage = idToMarketItem[itemId].royaltiesPercentage;

        // Transaction value shouled be equivalent to the NFT price
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        // Seller can't buy his own token
        require(
            idToMarketItem[itemId].seller != msg.sender,
            "You can't buy your own token"
        );

        // Transfer the value to the owner (with deduction of the royalties)
        idToMarketItem[itemId].seller.transfer(
            msg.value * (1 - (royaltiesPercentage / 100))
        );

        // Royalties transfert
        idToMarketItem[itemId].originalCreator.transfer(
            msg.value * (royaltiesPercentage / 100)
        );

        // Update the ownership  (NFT contract)
        IERC721(nftContract).transferFrom(
            address(this),
            msg.sender,
            idToMarketItem[itemId].tokenId
        );

        // Update the ownership  (Market contract)
        idToMarketItem[itemId].owner = payable(msg.sender);

        // Track the number of times NFT was sold
        idToMarketItem[itemId].sold = idToMarketItem[itemId].sold++;

        // Increment the total number of NFT sold
        _itemsSold.increment();

        // Tranfert the listing fee to the owner
        payable(owner).transfer(listingPrice);
    }

    /* 
        List an existing Item 
        @param itemId: itemId in the Market contract
        @param price: Price for the NFT
        @param nftContract: address of the NFT contract
    */
    function listMarketItem(
        uint256 itemId,
        uint256 price,
        address nftContract
    ) public payable nonReentrant {
        // Price of the NFT has to be more than 1 wei
        require(price > 0, "Price must be at least 1 wei");

        // Value of the transaction should be the same than the listing price
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        // Sender has to be the owner of the NFT
        require(
            idToMarketItem[itemId].owner == msg.sender,
            "Only the owner can sell his own NFT"
        );

        // Update the seller and owner value (Market contract)
        idToMarketItem[itemId].seller = idToMarketItem[itemId].owner;
        idToMarketItem[itemId].owner = payable(address(0));

        // Update the ownership (NFT contract)
        IERC721(nftContract).transferFrom(
            msg.sender,
            address(this),
            idToMarketItem[itemId].tokenId
        );

        // Since NFT was listed , need to decrement the number of sold item
        _itemsSold.decrement();

        // Emit an event for the listing of an existing NFT
        emit MarketItemRelisted(
            itemId,
            nftContract,
            idToMarketItem[itemId].tokenId,
            msg.sender,
            address(0),
            price
        );
    }

    /* 
        Returns all listed items on the market.
        No param
    */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        // List of listed items (to be returned)
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        // Loop all the items. Only items with an owner "0" are returned
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* 
        Returns only items that a user has purchased 
        No param
    */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // Calculate number of NFT owned by the user
        // This value is needed to know the size of the returned array
        // (impossible to instantiate a memory dynamic array in solidity )
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        // List of listed items (to be returned)
        MarketItem[] memory items = new MarketItem[](itemCount);

        // Loop all items. Only items owned by the user are returned
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* 
        Returns only items a user has created 
        No param
    */
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // Calculate number of NFT created by the user
        // This value is needed to know the size of the returned array
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        // List of listed items (to be returned)
        MarketItem[] memory items = new MarketItem[](itemCount);

        // Loop all items. Only items created by the user are returned
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* 
        Returns only specific item 
        No param
    */
    function fetchItem(uint256 itemId) public view returns (MarketItem memory) {
        return idToMarketItem[itemId];
    }
}
