// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721URIStorage {
    // Counter for incrementing NFT id
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // NFT market address
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("NFT MarketPlace", "NMP") {
        contractAddress = marketplaceAddress;
    }

    // Mint a token, with its URI that contains metadata
    function createToken(string memory tokenURI) public returns (uint256) {
        // Increment the counter
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        // Mint and set the URI for metadata
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }
}
