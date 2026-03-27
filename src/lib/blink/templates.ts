import { BlinkTemplate } from "./types";

const DEFAULT_DONATION_WALLET =
  process.env.SOLANA_DONATION_WALLET ?? "6BfszDPKPpEYUDPoPxHB2foBnBKEWXgbg19UUj3WTvii";

export const seedTemplates: BlinkTemplate[] = [
  {
    slug: "donate-sol",
    title: "Support the Shelter",
    description: "Donate SOL to support the animal shelter with a single click.",
    icon: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop",
    receiver: DEFAULT_DONATION_WALLET,
    defaultAmount: 1,
    amountOptions: [1, 5, 10],
    customAmountLabel: "Enter a custom SOL amount",
    maxAmount: 1_000,
    isActive: true,
  },
];
