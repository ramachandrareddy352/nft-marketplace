// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract marketplace is ReentrancyGuard {
    uint public itemCount;
    address payable public immutable feeAccount;
    uint public immutable feePercent;

    struct Item {
        uint itemId;
        IERC721 nft; // here nft is object created from IERC721 contract to run the functions
        uint tokenId;
        uint price;
        address owner;
        address payable seller;
        bool ready;
        uint networkId;
    }

    mapping(uint => Item) public items;

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    );
    event Bought(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    constructor(uint256 _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem(
        IERC721 _nft,
        uint _tokenId,
        uint _price,
        uint _networkId
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        itemCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            msg.sender,
            payable(msg.sender),
            true,
            _networkId
        );
        emit Offered(itemCount, address(_nft), _tokenId, _price, msg.sender);
    }

    function cancelNft(IERC721 _nft, uint _tokenId) public nonReentrant {
        Item memory item = items[_tokenId];
        require(item.price > 0, "nft not listed for sale");
        require(item.ready == true, "item is not able to cancel");
        require(item.seller == msg.sender, "you are not the owner of NFT");
        _nft.transferFrom(address(this), msg.sender, _tokenId);
        items[_tokenId].ready = false;
    }

    function reEnterNft(IERC721 _nft, uint _tokenId) public nonReentrant {
        Item memory item = items[_tokenId];
        require(item.price > 0, "nft item is not found");
        require(item.ready == false, "item is already in marketplace");
        require(item.seller == msg.sender, "you are not the owner of NFT");
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        items[_tokenId].ready = true;
    }

    function editPrice(uint _tokenId, uint _price) public {
        Item memory item = items[_tokenId];
        require(item.price > 0, "nft is not for sale");
        require(item.seller == msg.sender, "you are not the owner of NFT");
        require(item.ready == true, "item is not ready for sale");
        require(_price > 0, "price must be greater then zero");
        items[_tokenId].price = _price;
    }

    function purchaseItem(
        IERC721 _nft,
        uint _itemId
    ) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(
            msg.value >= _totalPrice,
            "not enough ether to cover item price and market fee"
        );
        require(item.ready == true, "item is not ready for sale");
        require(item.price > 0, "item does not exit");
        // pay seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        items[_itemId].ready = false;
        items[_itemId].seller = payable(msg.sender);
        _nft.transferFrom(address(this), msg.sender, item.tokenId); // transfer nft to buyer
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function getTotalPrice(uint _itemId) public view returns (uint) {
        return ((items[_itemId].price * (100 + feePercent)) / 100);
    }
}
