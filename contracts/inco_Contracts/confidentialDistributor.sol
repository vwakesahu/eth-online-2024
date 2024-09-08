// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "fhevm@0.3.x/lib/TFHE.sol";
import "fhevm@0.3.x/abstracts/EIP712WithModifier.sol";

contract PayRoll is
    Ownable,
    ReentrancyGuard,
    EIP712WithModifier("Authorization token", "1")
{
    IERC20 public token;
    address public mailbox = 0xb7BB43b13B08C971713EE2fD59A89F213DCc9C59;
    address public remoteContract;
    uint32 public remoteDomain;
    uint256 public lastAmount;
    uint256 private constant TOKEN_DECIMALS = 18; // 18 decimals for Ether

    event DispatchProxy(
        uint32 indexed destination,
        bytes32 indexed recipient,
        bytes actualMessage
    );

    mapping(address => euint32) private ownerToBalance;

    constructor() Ownable(msg.sender) {
        remoteDomain = 656476;
    }

    function initialize(address _remoteContract) external onlyOwner {
        remoteContract = _remoteContract;
    }

    function dispatchTokens(uint256 amount,address owner) internal {
        require(amount > 0, "Amount must be greater than 0");
        // Send a message to the remote chain to mint the tokens
        bytes memory message = abi.encode(owner, amount);
        IMailbox(mailbox).dispatch(
            remoteDomain,
            addressToBytes32(remoteContract),
            message
        );
        emit DispatchProxy(
            remoteDomain,
            addressToBytes32(remoteContract),
            message
        );
    }

    function balanceOfMe(bytes32 publicKey, bytes calldata signature)
        public
        view
        onlySignedPublicKey(publicKey, signature)
        returns (bytes memory)
    {
        return TFHE.reencrypt(ownerToBalance[msg.sender], publicKey, 0);
    }

    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _data
    ) public payable {
        require(_origin == remoteDomain, "Invalid source domain");
        require(
            _sender == bytes32(addressToBytes32(remoteContract)),
            "Invalid source contract"
        );
        (address user, uint32 amount) = abi.decode(_data, (address, uint32));
        ownerToBalance[user] = TFHE.asEuint32(amount);
        lastAmount = amount;
    }

    function distributeFunds(
        address owner,
        address[] calldata users,
        bytes calldata encryptedValue
    ) external {
        lastAmount++;
        euint32 cumulativeAmount = TFHE.asEuint32(0);
        for (uint256 i = 0; i < users.length; i++) {
            euint32 encryptedValueFormatted = TFHE.asEuint32(encryptedValue);
            cumulativeAmount = TFHE.add(
                cumulativeAmount,
                encryptedValueFormatted
            );
            ownerToBalance[users[i]] = TFHE.add(
                ownerToBalance[users[i]],
                encryptedValueFormatted
            );
        }

        require(
            TFHE.decrypt(TFHE.le(cumulativeAmount, ownerToBalance[owner])),
            "Exceeds balance"
        );

        ownerToBalance[owner] = TFHE.sub(
            ownerToBalance[owner],
            cumulativeAmount
        );
    }

    function transferFunds(
        address owner,
        address receiver,
        bytes calldata encryptedAmount
    ) public {
        euint32 amount = TFHE.asEuint32(encryptedAmount);
        TFHE.optReq(TFHE.le(amount, ownerToBalance[owner]));
        ownerToBalance[receiver] = TFHE.add(ownerToBalance[receiver], amount);
        ownerToBalance[owner] = TFHE.sub(ownerToBalance[owner], amount);
    }

    function withdrawFunds(address owner) external {
        uint32 decryptedAmount = TFHE.decrypt(ownerToBalance[owner]);
        ownerToBalance[owner] = TFHE.asEuint32(0);
        dispatchTokens(uint256(decryptedAmount) * (10**TOKEN_DECIMALS),owner);
    }

    function addressToBytes32(address _addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }

    function bytes32ToAddress(bytes32 _buf) internal pure returns (address) {
        return address(uint160(uint256(_buf)));
    }

    modifier onlyServer() {
        if (msg.sender != 0x1950498e95274Dc79Fbca238C2BE53684D69886F) {
            revert();
        }
        _;
    }
}

interface IMailbox {
    function dispatch(
        uint32 destinationDomain,
        bytes32 recipientAddress,
        bytes calldata messageBody
    ) external payable returns (bytes32 messageId);

    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _data
    ) external payable;
}
