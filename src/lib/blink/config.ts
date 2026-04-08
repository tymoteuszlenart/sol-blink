import { BLOCKCHAIN_IDS } from "@solana/actions";
import { PublicKey } from "@solana/web3.js";

const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const DEFAULT_BLOCKCHAIN_ID = BLOCKCHAIN_IDS.devnet;
const DEFAULT_DEV_WALLET = "6BfszDPKPpEYUDPoPxHB2foBnBKEWXgbg19UUj3WTvii";

export function resolveBlockchainId(value: string | undefined): string {
  const supported = Object.values(BLOCKCHAIN_IDS) as string[];
  const aliases: Record<string, string> = {};
  for (const [key, id] of Object.entries(BLOCKCHAIN_IDS)) {
    aliases[key] = id as string;
    aliases[`solana:${key}`] = id as string;
  }

  if (!value) {
    return DEFAULT_BLOCKCHAIN_ID;
  }

  const resolved = aliases[value] ?? value;
  if (!supported.includes(resolved)) {
    const names = Object.keys(aliases).join(", ");
    throw new Error(
      `[config] SOLANA_BLOCKCHAIN_ID="${value}" is not supported. Use one of: ${names}`
    );
  }
  return resolved;
}

export function resolveDonationWallet(): string {
  const wallet = process.env.SOLANA_DONATION_WALLET;
  if (!wallet) {
    return DEFAULT_DEV_WALLET;
  }
  try {
    new PublicKey(wallet);
  } catch {
    throw new Error(
      `[config] SOLANA_DONATION_WALLET is not a valid public key: "${wallet}"`
    );
  }
  return wallet;
}

export function getBlinkRuntimeConfig() {
  return {
    rpcUrl: process.env.SOLANA_RPC_URL ?? DEFAULT_RPC_URL,
    blockchainId: resolveBlockchainId(process.env.SOLANA_BLOCKCHAIN_ID),
    donationWallet: resolveDonationWallet(),
  };
}

/**
 * Validates that all required Solana config is present.
 * Call lazily at API request time — not during build or static rendering.
 */
export function validateProductionConfig(): void {
  if (process.env.NODE_ENV !== "production") return;

  if (!process.env.SOLANA_RPC_URL) {
    throw new Error("[config] SOLANA_RPC_URL is required in production");
  }
  if (!process.env.SOLANA_BLOCKCHAIN_ID) {
    throw new Error("[config] SOLANA_BLOCKCHAIN_ID is required in production");
  }
  if (!process.env.SOLANA_DONATION_WALLET) {
    throw new Error("[config] SOLANA_DONATION_WALLET is required in production");
  }
}
