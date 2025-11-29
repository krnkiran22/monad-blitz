# Smart Contract Deployment Guide

## Fixed Issues

✅ **Stack too deep error resolved** by:

- **Splitting large functions**: Reduced `submitDispute` from 6 to 3 parameters
- **Two-step submission**: Basic info first, then additional details via `setDisputeDetails`
- **Eliminated helper functions**: Removed `_createDispute` to avoid parameter passing
- **Direct storage access**: No local variables, direct mapping assignments

## Why the Stack Depth Error Occurred

The "Stack too deep" error happens when:

1. **Too many function parameters** (6 string parameters = high stack usage)
2. **Complex string handling** in inline assembly during compilation
3. **Local variables accumulation** across function calls
4. **Memory vs calldata** - strings consume significant stack space

### Solution Applied:

- **Reduced parameters**: `submitDispute` now takes only 3 essential parameters
- **Separate function**: `setDisputeDetails` handles remaining 3 parameters
- **No helper functions**: Direct assignment eliminates parameter passing overhead

## Deployment Steps

### 1. Compile in Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file: `DisputeResolution.sol`
3. Copy the optimized contract code from `contracts/DisputeResolution.sol`
4. In the Solidity Compiler tab:
   - Select compiler version: `0.8.19+`
   - Enable **Optimization**: Set runs to `200`
   - Click **Compile DisputeResolution.sol**

### 2. Deploy to Testnet

1. Go to **Deploy & Run Transactions** tab
2. Select **Environment**: "Injected Provider - MetaMask"
3. Connect your MetaMask wallet
4. Ensure you're on the correct testnet (e.g., Sepolia, Mumbai)
5. Select `DisputeResolution` contract
6. Click **Deploy**
7. Confirm transaction in MetaMask

### 3. Update Frontend Configuration

After successful deployment:

1. Copy the contract address from Remix
2. Update `DISPUTE_CONTRACT_ADDRESS` in your frontend files:
   - `src/components/DisputePage.tsx`
   - `src/pages/JurorPage.tsx`

```typescript
const DISPUTE_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 4. Authorize Jurors

As the contract owner:

1. Call `authorizeJuror(address)` function
2. Add wallet addresses of authorized jurors
3. Jurors can now review challenged disputes

### 5. Test the System

1. Submit a dispute through the frontend
2. Challenge the dispute
3. Authorized jurors can review and make decisions
4. Check transaction confirmations on block explorer

## Contract Functions

- `submitDispute()` - Submit new dispute with AI analysis
- `challengeDispute()` - Challenge an existing dispute
- `reviewDispute()` - Juror reviews challenged dispute
- `getAllChallengedDisputes()` - Get all disputes needing review
- `authorizeJuror()` - Owner adds new jurors
- `isAuthorizedJuror()` - Check juror authorization

## Gas Optimization

The optimized contract uses:

- `calldata` for external function parameters
- Helper functions to reduce stack depth
- Efficient data structures
- Minimal local variables in functions

## Troubleshooting

- **Still getting stack errors?** Enable optimization in Remix compiler
- **Transaction fails?** Check gas limit and network fees
- **Juror access denied?** Ensure wallet is authorized by contract owner
