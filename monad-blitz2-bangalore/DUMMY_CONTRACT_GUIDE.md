# Dummy Contract Deployment Guide

## Simple Contract for Monad Testnet

This is a basic smart contract designed for easy deployment on Monad testnet without any frontend integration needed.

## Contract Features

- ✅ Simple storage and retrieval functions
- ✅ Event emission
- ✅ Owner tracking
- ✅ No complex parameters or stack issues
- ✅ Minimal gas usage

## Deployment Steps

### 1. Open Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file: `DummyContract.sol`
3. Copy the contract code from `contracts/DummyContract.sol`

### 2. Compile

1. Go to **Solidity Compiler** tab
2. Select compiler version: `0.8.19+`
3. Click **Compile DummyContract.sol**
4. ✅ Should compile without any errors

### 3. Deploy to Monad Testnet

1. Go to **Deploy & Run Transactions** tab
2. Select **Environment**: "Injected Provider - MetaMask"
3. Connect your MetaMask wallet
4. **Switch to Monad Testnet** in MetaMask
5. Select `DummyContract` from dropdown
6. Click **Deploy**
7. Confirm transaction in MetaMask

### 4. Test Contract Functions

After deployment, you can test these functions:

#### Read Functions (Free):

- `name()` - Returns "Dummy Contract for Monad"
- `value()` - Returns current stored value (initially 42)
- `owner()` - Returns deployer address
- `getValue()` - Returns current value
- `getOwner()` - Returns owner address
- `hello()` - Returns "Hello from Monad Testnet!"

#### Write Functions (Costs Gas):

- `setValue(uint256)` - Set a new value and emit event

## Example Usage

1. Deploy the contract
2. Call `hello()` to test - should return "Hello from Monad Testnet!"
3. Call `getValue()` - should return 42
4. Call `setValue(123)` to change the value
5. Call `getValue()` again - should now return 123

## No Frontend Integration Required

This contract is standalone and doesn't need any frontend integration. You can interact with it directly through:

- Remix IDE
- Etherscan-like block explorers
- Web3 tools
- Command line tools

Perfect for testing Monad testnet deployment and basic contract interactions!
