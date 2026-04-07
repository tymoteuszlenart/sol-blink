import { BLOCKCHAIN_IDS } from "@solana/actions";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  resolveBlockchainId,
  resolveDonationWallet,
  validateProductionConfig,
} from "./config";

describe("config validation", () => {
  const savedEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...savedEnv };
  });

  afterEach(() => {
    process.env = { ...savedEnv };
  });

  describe("resolveBlockchainId", () => {
    it("resolves a human-readable alias to the hash ID", () => {
      expect(resolveBlockchainId("solana:devnet")).toBe(BLOCKCHAIN_IDS.devnet);
    });

    it("accepts an exact hash-style blockchain ID", () => {
      expect(resolveBlockchainId(BLOCKCHAIN_IDS.devnet)).toBe(
        BLOCKCHAIN_IDS.devnet
      );
    });

    it("throws for an unsupported blockchain ID", () => {
      expect(() => resolveBlockchainId("solana:fakenet")).toThrow(
        /not supported/
      );
    });

    it("falls back to devnet when unset", () => {
      expect(resolveBlockchainId(undefined)).toBe(BLOCKCHAIN_IDS.devnet);
    });
  });

  describe("resolveDonationWallet", () => {
    it("returns a valid wallet address from env", () => {
      process.env.SOLANA_DONATION_WALLET =
        "6BfszDPKPpEYUDPoPxHB2foBnBKEWXgbg19UUj3WTvii";
      expect(resolveDonationWallet()).toBe(
        "6BfszDPKPpEYUDPoPxHB2foBnBKEWXgbg19UUj3WTvii"
      );
    });

    it("throws for an invalid public key", () => {
      process.env.SOLANA_DONATION_WALLET = "not-a-valid-key";
      expect(() => resolveDonationWallet()).toThrow(/not a valid public key/);
    });

    it("falls back to dev wallet when unset", () => {
      delete process.env.SOLANA_DONATION_WALLET;
      expect(resolveDonationWallet()).toBeTruthy();
    });
  });

  describe("validateProductionConfig", () => {
    it("does not throw in development even when vars are missing", () => {
      process.env.NODE_ENV = "development";
      delete process.env.SOLANA_RPC_URL;
      delete process.env.SOLANA_BLOCKCHAIN_ID;
      delete process.env.SOLANA_DONATION_WALLET;
      expect(() => validateProductionConfig()).not.toThrow();
    });

    it("throws in production when SOLANA_RPC_URL is missing", () => {
      process.env.NODE_ENV = "production";
      delete process.env.SOLANA_RPC_URL;
      process.env.SOLANA_BLOCKCHAIN_ID = "solana:devnet";
      process.env.SOLANA_DONATION_WALLET =
        "6BfszDPKPpEYUDPoPxHB2foBnBKEWXgbg19UUj3WTvii";
      expect(() => validateProductionConfig()).toThrow(/SOLANA_RPC_URL/);
    });

    it("throws in production when SOLANA_DONATION_WALLET is missing", () => {
      process.env.NODE_ENV = "production";
      process.env.SOLANA_RPC_URL = "https://api.devnet.solana.com";
      process.env.SOLANA_BLOCKCHAIN_ID = "solana:devnet";
      delete process.env.SOLANA_DONATION_WALLET;
      expect(() => validateProductionConfig()).toThrow(
        /SOLANA_DONATION_WALLET/
      );
    });

    it("throws in production when SOLANA_BLOCKCHAIN_ID is missing", () => {
      process.env.NODE_ENV = "production";
      process.env.SOLANA_RPC_URL = "https://api.devnet.solana.com";
      delete process.env.SOLANA_BLOCKCHAIN_ID;
      process.env.SOLANA_DONATION_WALLET =
        "6BfszDPKPpEYUDPoPxHB2foBnBKEWXgbg19UUj3WTvii";
      expect(() => validateProductionConfig()).toThrow(
        /SOLANA_BLOCKCHAIN_ID/
      );
    });
  });
});
