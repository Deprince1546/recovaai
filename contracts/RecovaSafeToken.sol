// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RecovaSafeToken is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    event NativeAssetRecovered(address indexed owner, address indexed recipient, uint256 amount);
    event ERC20Recovered(address indexed owner, address indexed token, address indexed recipient, uint256 amount);

    error InvalidRecipient();
    error InvalidToken();
    error InvalidAmount();
    error InsufficientNativeBalance();
    error InsufficientTokenBalance();
    error CannotRecoverOwnToken();

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        address initialOwner_
    ) ERC20(name_, symbol_) Ownable(initialOwner_) {
        if (initialOwner_ == address(0)) {
            revert InvalidRecipient();
        }
        _mint(initialOwner_, initialSupply_ * 10 ** decimals());
    }

    function recoverNative(address payable recipient, uint256 amount) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert InvalidRecipient();
        if (amount == 0) revert InvalidAmount();
        uint256 balance = address(this).balance;
        if (amount > balance) revert InsufficientNativeBalance();
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Native asset transfer failed");
        emit NativeAssetRecovered(msg.sender, recipient, amount);
    }

    function recoverAllNative(address payable recipient) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert InvalidRecipient();
        uint256 balance = address(this).balance;
        if (balance == 0) revert InsufficientNativeBalance();
        (bool success, ) = recipient.call{value: balance}("");
        require(success, "Native asset transfer failed");
        emit NativeAssetRecovered(msg.sender, recipient, balance);
    }

    function recoverERC20(address token, address recipient, uint256 amount) external onlyOwner nonReentrant {
        if (token == address(0)) revert InvalidToken();
        if (recipient == address(0)) revert InvalidRecipient();
        if (token == address(this)) revert CannotRecoverOwnToken();
        if (amount == 0) revert InvalidAmount();
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (amount > balance) revert InsufficientTokenBalance();
        IERC20(token).safeTransfer(recipient, amount);
        emit ERC20Recovered(msg.sender, token, recipient, amount);
    }

    function recoverAllERC20(address token, address recipient) external onlyOwner nonReentrant {
        if (token == address(0)) revert InvalidToken();
        if (recipient == address(0)) revert InvalidRecipient();
        if (token == address(this)) revert CannotRecoverOwnToken();
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance == 0) revert InsufficientTokenBalance();
        IERC20(token).safeTransfer(recipient, balance);
        emit ERC20Recovered(msg.sender, token, recipient, balance);
    }

    receive() external payable {}
}
