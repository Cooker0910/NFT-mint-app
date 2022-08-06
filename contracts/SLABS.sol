// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SLABS is ERC20 {

    uint8 _decimals;
    uint256 totalSupply_ = 1000 ether;
    address public owner;

    mapping(address => uint256) balances;

    mapping(address => mapping (address => uint256)) allowed;

    constructor() ERC20("Starter Labs", "SLABS") {
      _decimals = 18;
      balances[msg.sender] = totalSupply_;
      owner = msg.sender;
    }

    function totalSupply() public view override returns (uint256) {
      return totalSupply_;
    }

    function mint(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
    }

    modifier onlyOwner() {
      require(msg.sender == owner, "!owner");
      _;
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender]-numTokens;
        balances[receiver] = balances[receiver]+numTokens;
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address tokenOwner, address delegate) public override view returns (uint) {
        return allowed[tokenOwner][delegate];
    }

    function transferFrom(address tokenOwner, address buyer, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[tokenOwner]);
        require(numTokens <= allowed[tokenOwner][msg.sender]);

        balances[tokenOwner] = balances[tokenOwner]-numTokens;
        allowed[tokenOwner][msg.sender] = allowed[tokenOwner][msg.sender]-numTokens;
        balances[buyer] = balances[buyer]+numTokens;
        emit Transfer(owner, buyer, numTokens);
        return true;
    }

}