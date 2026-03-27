# ⚡ One-Click Crypto Donations | Solana Hackathon Project

A seamless, zero-friction way to support creators, charities, and local initiatives directly from your social media feed. Built with **Solana Actions & Blinks**.

## 🎯 The Problem & The Solution
Web3 UX is currently broken for casual users. Donating to a cause usually requires leaving the app, connecting a wallet on a sketchy external site, and signing complex transactions. We lose 90% of potential donors to this friction.

**Our Solution:** We bring the transaction to the user. Using Solana Blinks, a standard X (Twitter) post becomes an interactive donation terminal. Users click "Tip 1 SOL", approve via their wallet extension, and they're done. 

No custom smart contracts, no wallet drainer risks—just pure, native Solana transfers.

## 🛠 Tech Stack
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Blockchain:** `@solana/web3.js`, `@solana/actions`
* **Network:** Solana Devnet

## 🚀 Quick Start (Local Testing)

1. Clone the repository and install dependencies:
   ```bash
   npm install
   cp .env.example .env.local
   ```

2. Configure environment variables in `.env.local`:
   ```bash
   SOLANA_RPC_URL=https://api.devnet.solana.com
   SOLANA_DONATION_WALLET=<your-devnet-wallet-address>
   SOLANA_BLOCKCHAIN_ID=solana:devnet
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Test the Solana Action (Blink):

* Go to dial.to
* Paste your local API endpoint URL (e.g., http://localhost:3000/api/actions/donate-sol)
* Or paste your discovery endpoint (http://localhost:3000/.well-known/actions.json)
* Connect your Phantom wallet (on Devnet) and test the flow!

## ✅ Deployment Checklist

- Set `SOLANA_RPC_URL`, `SOLANA_DONATION_WALLET`, and `SOLANA_BLOCKCHAIN_ID` in your hosting provider (e.g. Vercel).
- Verify discovery endpoint responds: `/.well-known/actions.json`.
- Verify action endpoint responds: `/api/actions/donate-sol`.
- Open your deployed URL in [dial.to](https://dial.to/) and run a full donation flow on Devnet.
- Run local checks before release:
  - `npm run lint`
  - `npm run test`

## 💡 What's Next?

While this MVP focuses on charitable donations, the underlying architecture can easily be expanded to one-click ticketing (cNFTs), premium content unlocks, and micro-crowdfunding.