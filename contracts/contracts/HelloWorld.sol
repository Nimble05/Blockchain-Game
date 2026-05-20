// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title HelloWorld - 用於測試合約部署環境
contract HelloWorld {
    string public message;
    address public owner;

    event MessageUpdated(string oldMessage, string newMessage, address updatedBy);

    constructor(string memory _message) {
        message = _message;
        owner = msg.sender;
    }

    function setMessage(string memory _newMessage) public {
        string memory old = message;
        message = _newMessage;
        emit MessageUpdated(old, _newMessage, msg.sender);
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}