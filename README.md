# ⚡ Solana Blink Wrapper (DB-ready)

A fast, customizable wrapper for Solana Actions where each Blink is template-driven by slug, not hardcoded route logic.

## What It Does
- Serves dynamic Action endpoints at `/api/actions/[slug]`.
- Uses a shared wrapper engine for GET/POST/OPTIONS action flow.
- Keeps a seed template repository now, with clear migration path to DB-backed templates.
- Keeps `/api/actions/donate-sol` as a backwards-compatible alias.

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
* Paste your local API endpoint URL (e.g., `http://localhost:3000/api/actions/donate-sol`)
* Or test dynamic slugs (e.g., `http://localhost:3000/api/actions/donate-sol`)
* Or paste your discovery endpoint (http://localhost:3000/.well-known/actions.json)
* Connect your Phantom wallet (on Devnet) and test the flow!

## Wrapper Architecture

- Template model: `src/lib/blink/types.ts`
- Repository interface + in-memory adapter: `src/lib/blink/repository.ts`
- Seed template registry: `src/lib/blink/templates.ts`
- Shared action handler engine: `src/lib/blink/action-handler.ts`
- Dynamic wrapper route: `src/app/api/actions/[slug]/route.ts`

## DB Migration Path

1. Keep `InMemoryTemplateRepository` as development fallback.
2. Add Prisma schema for `blink_templates`.
3. Implement `TemplateRepository` with Prisma/Postgres adapter.
4. Swap repository wiring in the action handler without changing route files.
5. Add admin create/update template endpoints for builder UI.

## ✅ Deployment Checklist

- Set `SOLANA_RPC_URL`, `SOLANA_DONATION_WALLET`, and `SOLANA_BLOCKCHAIN_ID` in your hosting provider (e.g. Vercel).
- Verify discovery endpoint responds: `/.well-known/actions.json`.
- Verify action endpoint responds: `/api/actions/donate-sol` and `/api/actions/[slug]`.
- Open your deployed URL in [dial.to](https://dial.to/) and run a full donation flow on Devnet.
- Run local checks before release:
  - `npm run lint`
  - `npm run test`

## Next Steps

- Add DB-backed template repository.
- Add template CRUD API and authentication for admin editing.
- Add integration tests for dynamic route + repository adapters.