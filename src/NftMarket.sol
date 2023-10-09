// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftMarket is ERC721, Ownable, ReentrancyGuard, PaymentSplitter {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker; // creating add cart list, set max limit mint in a collection

    /* ------------------------------- ERROR ------------------------------- */
    error NftMarketPlace__NotEnoughAmountToMint();
    error NftMarketPlace__TokenIdNotExists();
    error NftMarketPlace__InvalidPrice();
    error NftMarketPlace__YouAreNotTheOwner();
    error NftMarketPlace__ItemAlreadyInSale();
    error NftMarketPlace__ItemAlreadyNotInSale();
    error NftMarketPlace__InvalidZeroAddress();
    error NftMarketPlace__TokenTransferFailed();
    error NftMarketPlace__CannotBuyYourOwnToken();
    error NftMarketPlace__NotEnoughAmountToBuy();
    error NftMarketPlace__CallerIsNotOwnerNorApproved();
    error NftMarketPlace__AlreadyInWhiteList();
    error NftMarketPlace__PersonNotInWhiteList();
    error NftMarketPlace__MaxLimitOfTokensAreMinted();
    error NftMarketPlace__CollectionMaxLimitTokensMinted();

    /* ------------------------------- STRUCT ------------------------------- */
    struct Item {
        uint256 tokenId;
        uint256 price;
        string itemUri;
        address payable mintedBy;
        address payable currentOwner;
        bool readyForSale;
    }

    /* ------------------------------- EVENTS ------------------------------- */
    event MintNftEvent(uint256 _tokenId, address _mintedBy);
    event BatchMintEvent(uint256 _totalNft, address _mintedBy);
    event TokenBought(address _owner, address _buyer, uint256 _tokenId, uint256 _price);
    event BurnTokenEvent(address _owner, uint256 _tokenId);

    /* ------------------------------- MAPPINGS ------------------------------- */
    mapping(uint256 => Item) private minter; //returs data of token
    mapping(uint256 => address) private tokenMintedBy;
    mapping(address => uint256[]) private mintedByUser; //token-ids minted by a user
    mapping(address => uint256[]) private boughtByUser; // items bought by a user
    mapping(address => bool) private whitelisted; //returns the whitelsited addresses
    mapping(address => uint256) private receiverShares; // returns the share of a owner
    mapping(address => uint256) private tokensMintedByUser; // no of tokens minted by a user

    /* ------------------------------- COLLECTION VARIABLES ------------------------------- */
    uint256 private immutable i_royaltyPercentage; // royalty percent that fixed for collection
    address[] private s_royaltyReceivers;

    /* ------------------------------- ITEM VARIABLES ------------------------------- */
    uint256 private mintingFeeForAll = 0.2 ether;
    uint256 private mintingFeeForWhiteList = 0.1 ether;
    uint256 private constant MAX_TOKEN_CAN_MINT = 50;
    uint256 private constant OVER_ALL_TOKENS_CAN_MINT = 5000;

    /* ------------------------------- MODIFIERS ------------------------------- */
    modifier isTokenExist(uint256 _tokenId) {
        if (!_exists(_tokenId)) {
            revert NftMarketPlace__TokenIdNotExists();
        }
        _;
    }

    modifier isOwnerOfToken(uint256 _tokenId) {
        if (msg.sender != ownerOf(_tokenId)) {
            revert NftMarketPlace__YouAreNotTheOwner();
        }
        _;
    }

    /* ------------------------------- CONSTRUCTOR FUNCTION ------------------------------- */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _royaltyPercentage,
        address[] memory _royaltyReceivers,
        uint256[] memory _shares
    ) payable ERC721(_name, _symbol) PaymentSplitter(_royaltyReceivers, _shares) {
        i_royaltyPercentage = _royaltyPercentage;
        s_royaltyReceivers = _royaltyReceivers;
        for (uint256 i = 0; i < _royaltyReceivers.length; i++) {
            addWhiteList(_royaltyReceivers[i]); // all royalty reeivers are in white list by default
            addReceiverShares(_royaltyReceivers[i], _shares[i]);
        }
    }

    /* ------------------------------- MINT TOKEN ------------------------------- */
    function mintNft(string memory _tokenURI) external payable nonReentrant returns (uint256) {
        uint256 _tokenId = _tokenIdTracker.current();
        if (_tokenId + 1 > OVER_ALL_TOKENS_CAN_MINT) {
            revert NftMarketPlace__CollectionMaxLimitTokensMinted();
        }
        if (tokensMintedByUser[msg.sender] + 1 > MAX_TOKEN_CAN_MINT) {
            revert NftMarketPlace__MaxLimitOfTokensAreMinted();
        }
        if (whitelisted[msg.sender]) {
            if (msg.value != mintingFeeForWhiteList) {
                revert NftMarketPlace__NotEnoughAmountToMint();
            }
        } else {
            if (msg.value != mintingFeeForAll) {
                revert NftMarketPlace__NotEnoughAmountToMint();
            }
        }
        _safeMint(msg.sender, _tokenId);
        mintedByUser[msg.sender].push(_tokenId);
        tokensMintedByUser[msg.sender] += 1; // increasing the mint count of user
        tokenMintedBy[_tokenId] = msg.sender;
        if (!_exists(_tokenId)) {
            revert NftMarketPlace__TokenIdNotExists();
        }
        minter[_tokenId] = Item(_tokenId, 0, _tokenURI, payable(msg.sender), payable(msg.sender), false);
        _tokenIdTracker.increment();
        emit MintNftEvent(_tokenId, msg.sender);
        return (_tokenId);
    }

    /* ------------------------------- BATCH MINT TOKENS ------------------------------- */
    function batchMint(string memory _tokenURI, uint256 count) external payable nonReentrant returns (uint256) {
        uint256 _tokenId = _tokenIdTracker.current();
        if (_tokenId + count > OVER_ALL_TOKENS_CAN_MINT) {
            revert NftMarketPlace__CollectionMaxLimitTokensMinted();
        }
        if (tokensMintedByUser[msg.sender] + count > MAX_TOKEN_CAN_MINT) {
            revert NftMarketPlace__MaxLimitOfTokensAreMinted();
        }
        if (whitelisted[msg.sender]) {
            if (msg.value != mintingFeeForWhiteList * count) {
                revert NftMarketPlace__NotEnoughAmountToMint();
            }
        } else {
            if (msg.value != mintingFeeForAll * count) {
                revert NftMarketPlace__NotEnoughAmountToMint();
            }
        }
        for (uint256 i = 0; i < count; i++) {
            _batchMint(_tokenURI);
        }
        tokensMintedByUser[msg.sender] += count; // increasing the mint count of user
        emit BatchMintEvent(count, msg.sender);
        return count;
    }

    function _batchMint(string memory _tokenURI) private {
        uint256 _tokenId = _tokenIdTracker.current();
        _safeMint(msg.sender, _tokenId);
        mintedByUser[msg.sender].push(_tokenId);
        tokenMintedBy[_tokenId] = msg.sender;
        if (!_exists(_tokenId)) {
            revert NftMarketPlace__TokenIdNotExists();
        }
        minter[_tokenId] = Item(_tokenId, 0, _tokenURI, payable(msg.sender), payable(msg.sender), false);
        _tokenIdTracker.increment();
        emit MintNftEvent(_tokenId, msg.sender);
    }

    /* ------------------------------- MAKE TOKEN INTO MARKET ------------------------------- */
    function makeItem(uint256 _tokenId, uint256 _price)
        external
        isTokenExist(_tokenId)
        isOwnerOfToken(_tokenId)
        nonReentrant
        returns (bool)
    {
        if (_price <= 0) {
            revert NftMarketPlace__InvalidPrice();
        }
        Item storage item = minter[_tokenId];
        if (item.readyForSale == true) {
            revert NftMarketPlace__ItemAlreadyInSale();
        }
        item.price = _price;
        item.readyForSale = true;
        transferFrom(msg.sender, address(this), _tokenId);
        // we have to approve the address(this) contract to receive the token
        return true;
    }

    /* ------------------------------- CANCELLING TOKEN FORM MARKET ------------------------------- */
    function cancelNft(uint256 _tokenId)
        external
        isTokenExist(_tokenId)
        isOwnerOfToken(_tokenId)
        nonReentrant
        returns (bool)
    {
        if (minter[_tokenId].readyForSale == false) {
            revert NftMarketPlace__ItemAlreadyNotInSale();
        }
        minter[_tokenId].readyForSale = false;
        minter[_tokenId].price = 0;
        transferFrom(address(this), msg.sender, _tokenId);
        return true;
    }

    /* ------------------------------- EDIT PRICE OF TOKEN ------------------------------- */
    function editPrice(uint256 _tokenId, uint256 _newPrice)
        external
        isTokenExist(_tokenId)
        isOwnerOfToken(_tokenId)
        nonReentrant
        returns (bool)
    {
        if (minter[_tokenId].readyForSale == false) {
            revert NftMarketPlace__ItemAlreadyNotInSale();
        }
        minter[_tokenId].price = _newPrice; // while in sale the owner of token is address(this), can we edit price?
        return true;
    }

    /* ------------------------------- TRANSFER TOKEN WITHOUT SELLING -------------------------------*/
    function transferToken(uint256 _tokenId, address _to)
        public
        isTokenExist(_tokenId)
        isOwnerOfToken(_tokenId)
        nonReentrant
        returns (bool)
    {
        if (_to == address(0)) {
            revert NftMarketPlace__InvalidZeroAddress();
        }
        if (minter[_tokenId].readyForSale == true) {
            revert NftMarketPlace__ItemAlreadyInSale();
        }
        transferFrom(msg.sender, _to, _tokenId); // before transfering we have to approve the token to transfer
        if (ownerOf(_tokenId) != _to) {
            revert NftMarketPlace__TokenTransferFailed();
        }
        Item storage item = minter[_tokenId];
        item.currentOwner = payable(_to);
        return true;
    }

    /* ------------------------------- BUY TOKEN ------------------------------- */
    function buyItem(uint256 _tokenId) external payable isTokenExist(_tokenId) nonReentrant returns (bool) {
        if (msg.sender == ownerOf(_tokenId)) {
            revert NftMarketPlace__CannotBuyYourOwnToken();
        }
        if (minter[_tokenId].readyForSale == false) {
            revert NftMarketPlace__ItemAlreadyNotInSale();
        }
        if (msg.sender == address(0)) {
            revert NftMarketPlace__InvalidZeroAddress();
        }
        uint256 royaltyPrice = getRoyaltyPrice(_tokenId);
        uint256 tokenPrice = minter[_tokenId].price;
        address tokenOwner = minter[_tokenId].currentOwner;
        if (tokenPrice != msg.value) {
            revert NftMarketPlace__NotEnoughAmountToBuy();
        }
        payable(tokenOwner).transfer(tokenPrice - royaltyPrice);
        payable(address(this)).transfer(royaltyPrice);
        transferFrom(address(this), msg.sender, _tokenId); // beforing transfering approve the receiver
        boughtByUser[msg.sender].push(_tokenId);
        minter[_tokenId].price = 0;
        minter[_tokenId].readyForSale = false;
        minter[_tokenId].currentOwner = payable(msg.sender);
        emit TokenBought(tokenOwner, msg.sender, _tokenId, tokenPrice);
        return true;
    }

    /* ------------------------------- BURN TOKEN ------------------------------- */
    function burnToken(uint256 _tokenId)
        external
        isTokenExist(_tokenId)
        isOwnerOfToken(_tokenId)
        nonReentrant
        returns (bool)
    {
        if (minter[_tokenId].readyForSale == true) {
            revert NftMarketPlace__ItemAlreadyInSale();
        }
        delete minter[_tokenId]; // removing tuple from mappings
        if (!_isApprovedOrOwner(msg.sender, _tokenId)) {
            revert NftMarketPlace__CallerIsNotOwnerNorApproved();
        }
        _burn(_tokenId);
        emit BurnTokenEvent(msg.sender, _tokenId);
        return (!_exists(_tokenId));
    }

    /* ------------------------------- ADD & REMOVE WHITE LIST ------------------------------- */
    function addWhiteList(address _person) public onlyOwner {
        if (whitelisted[_person]) {
            revert NftMarketPlace__AlreadyInWhiteList();
        }
        whitelisted[_person] = true;
    }

    function removeWhiteList(address _person) external onlyOwner {
        if (!whitelisted[_person]) {
            revert NftMarketPlace__PersonNotInWhiteList();
        }
        whitelisted[_person] = false;
    }

    /* ------------------------------- HELPER FUNCTIONS ------------------------------- */
    function getRoyaltyPrice(uint256 _tokenId) private view returns (uint256) {
        Item memory item = minter[_tokenId]; // maintain the price in terms of WEI
        return uint256((item.price * i_royaltyPercentage) / 100);
    }

    function changingMintingFeeForAll(uint256 _newMintingFee) external onlyOwner {
        if (_newMintingFee <= 0) {
            revert NftMarketPlace__InvalidPrice();
        }
        mintingFeeForAll = _newMintingFee;
    }

    function changeMintingFeeForWhiteList(uint256 _newMintingFee) external onlyOwner {
        if (_newMintingFee <= 0) {
            revert NftMarketPlace__InvalidPrice();
        }
        mintingFeeForWhiteList = _newMintingFee;
    }

    function addReceiverShares(address _receiver, uint256 _share) private {
        receiverShares[_receiver] = _share;
    }

    /* ------------------------------- GETTER FUNCTIONS ------------------------------- */
    function getTokenOwner(uint256 _tokenId) external view isTokenExist(_tokenId) returns (address) {
        return ownerOf(_tokenId);
    }

    function getTokenMinterAddress(uint256 _tokenId) external view isTokenExist(_tokenId) returns (address) {
        return tokenMintedBy[_tokenId];
    }

    function getTokenData(uint256 _tokenId) external view isTokenExist(_tokenId) returns (Item memory) {
        return minter[_tokenId];
    }

    function getAllTokens() external view returns (uint256, Item[] memory) {
        uint256 totalTokens = _tokenIdTracker.current();
        Item[] memory m_AllItems = new Item[](totalTokens);
        uint256 count = 0;
        for (uint256 i = 0; i < totalTokens; i++) {
            if (!_exists(i)) {
                m_AllItems[count] = minter[i];
                count++;
            }
        }
        return (count, m_AllItems);
    }

    function getAllTokensDataBoughtByUser(address _user) external view returns (uint256, Item[] memory) {
        uint256 totalTokens = boughtByUser[_user].length;
        Item[] memory m_AllItems = new Item[](totalTokens);
        uint256 count = 0;
        for (uint256 i = 0; i < totalTokens; i++) {
            uint256 id = boughtByUser[_user][i];
            if (!_exists(id)) {
                m_AllItems[count] = minter[id];
                count++;
            }
        }
        return (count, m_AllItems);
    }

    function getAllTokensDataMintedByUser(address _user) external view returns (uint256, Item[] memory) {
        uint256 totalTokens = mintedByUser[_user].length;
        Item[] memory m_AllItems = new Item[](totalTokens);
        uint256 count = 0;
        for (uint256 i = 0; i < totalTokens; i++) {
            uint256 id = mintedByUser[_user][i];
            if (!_exists(id)) {
                m_AllItems[count] = minter[id];
                count++;
            }
        }
        return (count, m_AllItems);
    }

    function getTokenUri(uint256 _tokenId) external view returns (string memory) {
        return minter[_tokenId].itemUri;
    }

    function getCollectionOwner() external view returns (address) {
        return owner();
    }

    function getRecevierShares(address _receiver) external view returns (uint256) {
        return receiverShares[_receiver];
    }

    function getAllTokensBoughtByUser(address _user) external view returns (uint256[] memory) {
        return boughtByUser[_user];
    }

    function isWhiteListedUser(address _user) external view returns (bool) {
        return whitelisted[_user];
    }

    function getAllTokensMintedByUser(address _user) external view returns (uint256[] memory) {
        return mintedByUser[_user];
    }

    function getRoyaltyPercentage() external view returns (uint256) {
        return i_royaltyPercentage;
    }

    function getRoyaltyReceivers() external view returns (address[] memory) {
        return s_royaltyReceivers;
    }

    function getMintingFeeForAll() external view returns (uint256) {
        return mintingFeeForAll;
    }

    function getMintingFeeForWhiteList() external view returns (uint256) {
        return mintingFeeForWhiteList;
    }

    function getMaxLimitOfTokensMint() external pure returns (uint256) {
        return MAX_TOKEN_CAN_MINT;
    }
}
/*
 ~ in collection uri include, background uri, profile uri, name, symbol, description, date, extrenal link, category
 ~ in token uri include image uri, name, description, external link, file type
 ~ check the floor, ceil, volume, sold percent, total items in java script frontend part
 ~ date, category is stored in uri using javascript
*/
