// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SLABS is ERC20 {

    uint8 _decimals;
    uint256 public _totalSupply;
    address public owner;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _decimals = 18;
        _totalSupply = 1000000000;
        owner = msg.sender;
    }

    function decimals() public view virtual override returns (uint8) {
        if (_decimals > 0) return _decimals;
        return 18;
    }

    function totalSupply() public view override returns (uint256) {
      return _totalSupply;
    }

    function mint(uint256 amount) public onlyOwner {
        _mint(msg.sender, amount);
    }

    modifier onlyOwner() {
      require(msg.sender == owner, "!owner");
      _;
    }

}