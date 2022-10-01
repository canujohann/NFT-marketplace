// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    // Owner of the marketplace (Receives the listing fees)
    address payable owner;

    // Fees to pay to the owner of the marketplace for listing an NFT
    uint256 listingPrice = 0.050 ether;

    // User who deploy the contract is the owner of the market
    constructor() {
        owner = payable(msg.sender);
    }

    // NFT item information
    struct MarketItem {
        uint256 itemid;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        uint8 royaltiesPercentage;
        address payable originalCreator;
    }

    // List of all objects in the market
    mapping(uint256 => MarketItem) private idToMarketItem;

    // Event for a new NFT creation
    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        uint8 royaltiesPercentage,
        address originalCreator
    );

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Places an item for sale on the marketplace (= mint) */
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        uint8 royaltiesPercentage
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );
        require(
            royaltiesPercentage <= 15,
            "Please submit a royalties under 15%"
        );

        // Generate a new id
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
            false,
            royaltiesPercentage,
            payable(msg.sender)
        );

        // Update the ownership (from creator to the market contract address)
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false,
            royaltiesPercentage,
            msg.sender
        );
    }

    /* Creates the sale of a marketplace item (= sell) */
    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        uint256 price = idToMarketItem[itemId].price;
        uint256 tokenId = idToMarketItem[itemId].tokenId;
        uint8 royaltiesPercentage = idToMarketItem[itemId].royaltiesPercentage;

        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );

        // Transfer the price to the owner (with deduction of the royalties)
        idToMarketItem[itemId].seller.transfer(
            msg.value * (1 - (royaltiesPercentage / 100))
        );

        // Royalties transfert
        idToMarketItem[itemId].originalCreator.transfer(
            msg.value * (royaltiesPercentage / 100)
        );

        // Change the ownership within the NFT contract
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;

        _itemsSold.increment();

        // Tranfert the listing fee to the owner
        payable(owner).transfer(listingPrice);
    }

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

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

    /* Returns only items that a user has purchased */

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

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

    /* Returns only items a user has created */

    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);

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
}
