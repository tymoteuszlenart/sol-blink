import { BLOCKCHAIN_IDS } from "@solana/actions";

const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const DEFAULT_BLOCKCHAIN_ID = BLOCKCHAIN_IDS.devnet;

export function resolveBlockchainId(value: string | undefined): string {
  const supported = Object.values(BLOCKCHAIN_IDS) as string[];
  if (!value) {
    return DEFAULT_BLOCKCHAIN_ID;
  }
  return supported.includes(value) ? value : DEFAULT_BLOCKCHAIN_ID;
}

export function getBlinkRuntimeConfig() {
  return {
    rpcUrl: process.env.SOLANA_RPC_URL ?? DEFAULT_RPC_URL,
    blockchainId: resolveBlockchainId(process.env.SOLANA_BLOCKCHAIN_ID),
  };
}
