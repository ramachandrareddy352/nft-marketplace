// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NftMarket.sol";
import "./NftAuction.sol";

contract NftFactory is Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _collectionIdTracker;

    /* ----------------------------- ERRORS ----------------------------- */
    error NftCollection__InvalidManager();
    error NftCollection__InvalidCategory();
    error NftCollection__ExceedMaxRoyaltyPercentage();
    error NftCollection__CollectionDoesNotExists();
    error NftCollection__YouAreNotCollectionOwner();
    error NftCollection__CategoryCollectionAlreadyExist();

    /* ----------------------------- MAPPINGS ----------------------------- */
    mapping(uint256 => Collection) private collectionCreated;
    mapping(address => uint256[]) private userCollecions;
    mapping(uint256 => uint256[]) private categoryCollections;
    mapping(uint256 => bool) private isCollectionExists;
    mapping(address => mapping(uint256 => bool)) private isCategoryExists;

    /* ----------------------------- VARIABLES ----------------------------- */
    uint256 private constant MAX_ROYALTY = 100;

    /* ----------------------------- STRUCT ----------------------------- */
    struct Collection {
        uint256 collectionId;
        address manager;
        string collectionUri;
        NftMarket nftMarket;
        NftAuction nftAuction;
        uint256 royaltyPercentage;
        address[] royaltyReceivers;
        uint256[] shares;
        uint256 category;
    }

    /* ----------------------------- EVENTS ----------------------------- */
    event CollectionCreated(address owner, address deployedMarketAt, address deployedAuctionAt, uint256 category);

    /* ---------------------------- MODIFIERS ---------------------------- */
    modifier collectionExist(uint256 _collectionId) {
        if (!isCollectionExists[_collectionId]) {
            revert NftCollection__CollectionDoesNotExists();
        }
        _;
    }

    modifier isCollectionManager(uint256 _collectionId) {
        if (collectionCreated[_collectionId].manager != msg.sender) {
            revert NftCollection__YouAreNotCollectionOwner();
        }
        _;
    }

    /* ----------------------------- FUNCTIONS ----------------------------- */
    function createNewCollection(
        string memory _name,
        string memory _symbol,
        uint256 _royaltyPercentage,
        address[] memory _royaltyReceivers,
        uint256[] memory _shares,
        string memory _collectionUri,
        uint256 _category
    ) public nonReentrant {
        // _manager will take over the collection control and he will manage all the functions regards collection actions
        if (_royaltyPercentage > MAX_ROYALTY) {
            revert NftCollection__ExceedMaxRoyaltyPercentage();
        }
        if (msg.sender == address(0)) {
            revert NftCollection__InvalidManager();
        }
        if (_category < 0 || _category > 7) {
            revert NftCollection__InvalidCategory();
        }
        if (isCategoryExists[msg.sender][_category]) {
            revert NftCollection__CategoryCollectionAlreadyExist();
        }

        NftMarket nftContract1 = new NftMarket(_name, _symbol, _royaltyPercentage, _royaltyReceivers, _shares);
        NftAuction nftContract2 = new NftAuction(_name, _symbol, _royaltyPercentage, _royaltyReceivers, _shares);

        uint256 _collectionId = _collectionIdTracker.current();
        _collectionIdTracker.increment();
        collectionCreated[_collectionId] = Collection(
            _collectionId,
            msg.sender,
            _collectionUri,
            nftContract1,
            nftContract2,
            _royaltyPercentage,
            _royaltyReceivers,
            _shares,
            _category
        );
        isCategoryExists[msg.sender][_category] = true;
        isCollectionExists[_collectionId] = true;
        nftContract1.transferOwnership(msg.sender);
        nftContract2.transferOwnership(msg.sender);
        userCollecions[msg.sender].push(_collectionId);

        if (_category == 0) {
            categoryCollections[0].push(_collectionId); // ART
        } else if (_category == 1) {
            categoryCollections[1].push(_collectionId); // GAMING
        } else if (_category == 2) {
            categoryCollections[2].push(_collectionId); // EDUCATION
        } else if (_category == 3) {
            categoryCollections[3].push(_collectionId); // PFPS
        } else if (_category == 4) {
            categoryCollections[4].push(_collectionId); // NATURE
        } else if (_category == 5) {
            categoryCollections[5].push(_collectionId); // MUSIC
        } else if (_category == 6) {
            categoryCollections[6].push(_collectionId); // VIRTUAL WORLD
        } else if (_category == 7) {
            categoryCollections[7].push(_collectionId); // OTHERS
        }
        emit CollectionCreated(msg.sender, address(nftContract1), address(nftContract2), _category);
    }

    /* ----------------------------- HELPER FUNCTIONS ------------------------------- */

    function changeCollectionURI(uint256 _collectionId, string memory _newUri)
        external
        collectionExist(_collectionId)
        isCollectionManager(_collectionId)
        nonReentrant
        returns (bool)
    {
        collectionCreated[_collectionId].collectionUri = _newUri;
        return true;
    }

    function changeCollectionManager(uint256 _collectionId, address _newManager)
        external
        collectionExist(_collectionId)
        isCollectionManager(_collectionId)
        nonReentrant
        returns (bool)
    {
        collectionCreated[_collectionId].manager = _newManager;
        collectionCreated[_collectionId].nftMarket.transferOwnership(_newManager);
        collectionCreated[_collectionId].nftAuction.transferOwnership(_newManager);
        return true;
    }

    /* ----------------------------- GETTER FUNCTIONS ----------------------------- */
    function getMaxRoyalty() external pure returns (uint256) {
        return MAX_ROYALTY;
    }

    function getCollection(uint256 _collectionId)
        external
        view
        collectionExist(_collectionId)
        returns (Collection memory)
    {
        return collectionCreated[_collectionId];
    }

    function getUserCollectionIds(address _user) external view returns (uint256[] memory) {
        return userCollecions[_user];
    }

    function getCategoryCollections(uint256 _categoryNumber) external view returns (uint256[] memory) {
        return categoryCollections[_categoryNumber];
    }

    function getUserCollectionStruct(address _user) external view returns (uint256, Collection[] memory) {
        uint256 count = userCollecions[_user].length;
        Collection[] memory m_AllCollections = new Collection[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 id = userCollecions[_user][i];
            m_AllCollections[i] = collectionCreated[id];
        }
        return (count, m_AllCollections);
    }

    function getAllCollections() external view returns (uint256, Collection[] memory) {
        uint256 count = _collectionIdTracker.current();
        Collection[] memory m_AllCollections = new Collection[](count);
        for (uint256 i = 0; i < count; i++) {
            m_AllCollections[i] = collectionCreated[i];
        }
        return (count, m_AllCollections);
    }

    function getAllCategoryCollections(uint256 _category) external view returns (uint256, Collection[] memory) {
        uint256 count = categoryCollections[_category].length;
        Collection[] memory m_AllCollections = new Collection[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 id = categoryCollections[_category][i];
            m_AllCollections[i] = collectionCreated[id];
        }
        return (count, m_AllCollections);
    }
}
