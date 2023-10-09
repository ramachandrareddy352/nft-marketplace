// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NftAuction is ERC721, Ownable, ReentrancyGuard, PaymentSplitter {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker; // creating add cart list, set max limit mint in a collection

    /* ------------------------------- ERROR ------------------------------- */
    error NftAuction__CollectionMaxLimitTokensMinted();
    error NftAuction__TokenIdNotExists();
    error NftAuction__YouAreNotTheOwner();
    error NftAuction__MaxLimitOfTokensAreMinted();
    error NftAuction__NotEnoughAmountToMint();
    error NftAuction__AuctionIsCompleted();
    error NftAuction__LessThanBasePrice();
    error NftAuction__OwnerCannotBid();
    error NftAuction__AlreadyInWhiteList();
    error NftAuction__InvalidPrice();
    error NftAuction__PersonNotInWhiteList();
    error NftAuction__YouHaveAlreadyBided();
    error NftAuction__ParticipatersAreZero();
    error NftAuction__AuctionIsNotCompleted();

    /* ------------------------------- STRUCT ------------------------------- */
    struct Item {
        uint256 tokenId;
        uint256 basePrice;
        string itemUri;
        address payable mintedBy;
        address payable winner;
        uint256 winningAmount;
        bool auctionCompleted;
    }

    /* ------------------------------- EVENTS ------------------------------- */
    event MintNftEvent(uint256 _tokenId, address _mintedBy);
    event WinnerOfAuction(uint256 _tokenId, address _winner, uint256 _winningPrice);

    /* ------------------------------- MAPPINGS ------------------------------- */
    mapping(uint256 => Item) private minter; //returs data of token
    mapping(address => uint256[]) private mintedByUser; //token-ids minted by a user
    mapping(address => uint256[]) private boughtByUser; // items bought by a user
    mapping(address => bool) private whitelisted; //returns the whitelsited addresses
    mapping(address => uint256) private receiverShares; // returns the share of a owner
    mapping(address => uint256) private tokensMintedByUser; // no of tokens minted by a user
    mapping(uint256 => address[]) private bidingParticipaters; // participaters of biding
    mapping(uint256 => mapping(address => uint256)) private biddingAmount; // amount that bided by participater
    mapping(uint256 => mapping(address => bool)) private isParticipated; // finding if already bided

    /* ------------------------------- AUCTION VARIABLES ------------------------------- */
    uint256 private mintingFeeForAll = 0.2 ether;
    uint256 private mintingFeeForWhiteList = 0.1 ether;
    uint256 private constant MAX_TOKEN_CAN_MINT = 10;
    uint256 private constant OVER_ALL_TOKENS_CAN_MINT = 1000;

    /* ------------------------------- COLLECTION VARIABLES ------------------------------- */
    uint256 private immutable i_royaltyPercentage;
    address[] private s_royaltyReceivers;

    /* ------------------------------- MODIFIERS ------------------------------- */
    modifier isTokenExist(uint256 _tokenId) {
        if (!_exists(_tokenId)) {
            revert NftAuction__TokenIdNotExists();
        }
        _;
    }

    modifier isOwnerOfToken(uint256 _tokenId) {
        if (msg.sender != ownerOf(_tokenId)) {
            revert NftAuction__YouAreNotTheOwner();
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
    function mintNft(string memory _tokenURI, uint256 _basePrice) external payable nonReentrant returns (uint256) {
        uint256 _tokenId = _tokenIdTracker.current();
        if (_tokenId + 1 > OVER_ALL_TOKENS_CAN_MINT) {
            revert NftAuction__CollectionMaxLimitTokensMinted();
        }
        if (tokensMintedByUser[msg.sender] + 1 > MAX_TOKEN_CAN_MINT) {
            revert NftAuction__MaxLimitOfTokensAreMinted();
        }
        if (whitelisted[msg.sender]) {
            if (msg.value != mintingFeeForWhiteList) {
                revert NftAuction__NotEnoughAmountToMint();
            }
        } else {
            if (msg.value != mintingFeeForAll) {
                revert NftAuction__NotEnoughAmountToMint();
            }
        }
        _safeMint(msg.sender, _tokenId);
        mintedByUser[msg.sender].push(_tokenId);
        tokensMintedByUser[msg.sender] += 1; // increasing the mint count of user
        if (!_exists(_tokenId)) {
            revert NftAuction__TokenIdNotExists();
        }
        minter[_tokenId] = Item(_tokenId, _basePrice, _tokenURI, payable(msg.sender), payable(msg.sender), 0, false);
        transferFrom(msg.sender, address(this), _tokenId); // approve the contract to receive token
        _tokenIdTracker.increment();
        emit MintNftEvent(_tokenId, msg.sender);
        return (_tokenId);
    }

    /* ------------------------------- BID TOKEN ------------------------------- */
    function bidToken(uint256 _tokenId) public payable nonReentrant isTokenExist(_tokenId) returns (bool) {
        Item memory m_item = minter[_tokenId];
        if (msg.sender == ownerOf(_tokenId)) {
            revert NftAuction__OwnerCannotBid();
        }
        if (m_item.auctionCompleted) {
            revert NftAuction__AuctionIsCompleted();
        }
        if (isParticipated[_tokenId][msg.sender]) {
            revert NftAuction__YouHaveAlreadyBided();
        }
        if (msg.value <= m_item.basePrice) {
            revert NftAuction__LessThanBasePrice();
        }

        payable(address(this)).transfer(msg.value);
        isParticipated[_tokenId][msg.sender] = true;
        biddingAmount[_tokenId][msg.sender] = msg.value;
        bidingParticipaters[_tokenId].push(msg.sender);
        return true;
    }

    /* ------------------------------- ANOUNCE WINNER ------------------------------- */
    function announceWinner(uint256 _tokenId)
        external
        payable
        nonReentrant
        isTokenExist(_tokenId)
        isOwnerOfToken(_tokenId)
        returns (bool)
    {
        address[] memory m_participaters = bidingParticipaters[_tokenId];
        if (minter[_tokenId].auctionCompleted) {
            revert NftAuction__AuctionIsCompleted();
        }
        if (m_participaters.length <= 0) {
            revert NftAuction__ParticipatersAreZero();
        }

        // finding the winner and highest bid and participater
        address winner = m_participaters[0];
        uint256 highestBid = biddingAmount[_tokenId][m_participaters[0]];
        for (uint256 i = 1; i < m_participaters.length; i++) {
            if (biddingAmount[_tokenId][m_participaters[i]] > highestBid) {
                winner = m_participaters[i];
                highestBid = biddingAmount[_tokenId][m_participaters[i]];
            }
        }

        // transfering the ethers back
        for (uint256 i = 0; i < m_participaters.length; i++) {
            if (m_participaters[i] == winner && biddingAmount[_tokenId][m_participaters[i]] == highestBid) {
                continue;
            } else {
                payable(m_participaters[i]).transfer(biddingAmount[_tokenId][m_participaters[i]]);
            }
        }

        // transfering to minter and contract
        transferFrom(address(this), winner, _tokenId);
        minter[_tokenId].winner = payable(winner);
        minter[_tokenId].winningAmount = highestBid;
        minter[_tokenId].auctionCompleted = true;
        boughtByUser[winner].push(_tokenId);

        uint256 royaltyPrice = getRoyaltyPrice(highestBid);
        payable(minter[_tokenId].mintedBy).transfer(highestBid - royaltyPrice);
        payable(address(this)).transfer(royaltyPrice);
        emit WinnerOfAuction(_tokenId, winner, highestBid);

        return true;
    }

    /* ------------------------------- ADD & REMOVE WHITE LIST ------------------------------- */
    function addWhiteList(address _person) public onlyOwner {
        if (whitelisted[_person]) {
            revert NftAuction__AlreadyInWhiteList();
        }
        whitelisted[_person] = true;
    }

    function removeWhiteList(address _person) external onlyOwner {
        if (!whitelisted[_person]) {
            revert NftAuction__PersonNotInWhiteList();
        }
        whitelisted[_person] = false;
    }

    /* ------------------------------- HELPER FUNCTIONS ------------------------------- */
    function getRoyaltyPrice(uint256 _amount) private view returns (uint256) {
        return uint256((_amount * i_royaltyPercentage) / 100);
    }

    function changingMintingFeeForAll(uint256 _newMintingFee) external onlyOwner {
        if (_newMintingFee <= 0) {
            revert NftAuction__InvalidPrice();
        }
        mintingFeeForAll = _newMintingFee;
    }

    function changeMintingFeeForWhiteList(uint256 _newMintingFee) external onlyOwner {
        if (_newMintingFee <= 0) {
            revert NftAuction__InvalidPrice();
        }
        mintingFeeForWhiteList = _newMintingFee;
    }

    function addReceiverShares(address _receiver, uint256 _share) private {
        receiverShares[_receiver] = _share;
    }

    /* ------------------------------- GETTER FUNCTIONS ------------------------------- */
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

    function getAuctionData(uint256 _tokenId)
        external
        view
        isTokenExist(_tokenId)
        returns (address[] memory, uint256[] memory)
    {
        // auction data can able see after completion of bidding
        if (!minter[_tokenId].auctionCompleted) {
            revert NftAuction__AuctionIsNotCompleted();
        }
        address[] memory m_participaters = bidingParticipaters[_tokenId];
        uint256[] memory m_bidPrices = new uint256[](m_participaters.length);

        for (uint256 i = 0; i < m_participaters.length; i++) {
            m_bidPrices[i] = biddingAmount[_tokenId][m_participaters[i]];
        }

        return (m_participaters, m_bidPrices);
    }

    function getAuctionWinnerDetails(uint256 _tokenId)
        external
        view
        isTokenExist(_tokenId)
        returns (address, uint256)
    {
        if (!minter[_tokenId].auctionCompleted) {
            revert NftAuction__AuctionIsNotCompleted();
        }
        return (minter[_tokenId].winner, minter[_tokenId].winningAmount);
    }

    function getTokenOwner(uint256 _tokenId) external view isTokenExist(_tokenId) returns (address) {
        return ownerOf(_tokenId);
    }

    function getTokenMinterAddress(uint256 _tokenId) external view isTokenExist(_tokenId) returns (address) {
        return minter[_tokenId].mintedBy;
    }

    function getTokenData(uint256 _tokenId) external view isTokenExist(_tokenId) returns (Item memory) {
        return minter[_tokenId];
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

    function getCollectionMaxLimitOfTokensMint() external pure returns (uint256) {
        return OVER_ALL_TOKENS_CAN_MINT;
    }
}
