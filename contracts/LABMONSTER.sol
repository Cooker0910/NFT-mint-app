// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LabMonster is ERC721URIStorage, VRFConsumerBaseV2 {
    using Strings for uint256;
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // Rinkeby coordinator. For other networks,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    address vrfCoordinator = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 s_keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 100000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 1;

    address s_owner;

    string public baseTokenURI;
    address public tokenAddress;
    uint256 price;
    uint256 constant DECIMALS = 10**18;

    mapping(uint256 => address) s_rollers;
    mapping(address => uint256) s_results;

    uint256 private constant ROLL_IN_PROGRESS = 42;

    event DiceRolled(uint256 indexed requestId, address indexed roller);
    event DiceLanded(uint256 indexed requestId, uint256 indexed result);
    event output(uint256 output);

    constructor(
        uint64 subscriptionId,
        string memory _baseTokenURI,
        address _tokenAddress,
        uint256 _price
    ) ERC721("Lab Monstaer", "LAVMONSTER") VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_owner = msg.sender;
        s_subscriptionId = subscriptionId;
        baseTokenURI = _baseTokenURI;
        tokenAddress = _tokenAddress;
        price = _price;
    }

    function mint(uint256 mintID) public {
        require(
            IERC20(tokenAddress).balanceOf(msg.sender) > (price * DECIMALS),
            "Not enough SLABS to mint"
        );
        require(
            IERC20(tokenAddress).allowance(msg.sender, address(this)) > (price * DECIMALS),
            "Not enough SLABS to mint"
        );
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), price * DECIMALS);
        _safeMint(msg.sender, mintID);
    }

    function rollDice() public onlyOwner returns (uint256 requestId) {
        // require(s_results[roller] == 0, 'Already rolled');
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_rollers[requestId] = _msgSender();
        s_results[_msgSender()] = ROLL_IN_PROGRESS;
        emit DiceRolled(requestId, _msgSender());
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        uint256 d20Value = (randomWords[0] % 100) + 1;
        s_results[s_rollers[requestId]] = d20Value;
        emit DiceLanded(requestId, d20Value);
    }

    function house(address player) public view returns (uint256) {
        require(s_results[player] != 0, "Dice not rolled");
        require(s_results[player] != ROLL_IN_PROGRESS, "Roll in progress");
        return s_results[player];
        // s_results[player]=0;
        // emit output(_output);
        // return getTokenURI(_output);
    }

    function resettherandomvalue(address player) public {
        s_results[player] = 0;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        ".json"
                    )
                )
                : "";
    }

    modifier onlyOwner() {
        require(msg.sender == s_owner);
        _;
    }
}
