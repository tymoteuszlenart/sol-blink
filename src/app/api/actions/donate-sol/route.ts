import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";

import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

const DEFAULT_BLOCKCHAIN_ID = BLOCKCHAIN_IDS.devnet;
const DEFAULT_RPC_URL = "https://api.devnet.solana.com";
const DEFAULT_DONATION_WALLET = "6BfszDPKPpEYUDPoPxHB2foBnBKEWXgbg19UUj3WTvii";
const MAX_SOL_DONATION = 1_000;

const blockchain = resolveBlockchainId(process.env.SOLANA_BLOCKCHAIN_ID);
const connection = new Connection(process.env.SOLANA_RPC_URL ?? DEFAULT_RPC_URL);
const donationWallet = process.env.SOLANA_DONATION_WALLET ?? DEFAULT_DONATION_WALLET;

type ErrorBody = {
  error: string;
};

const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

export const OPTIONS = async () => {
  return new Response(null, { headers });
};

export const GET = async () => {
  const response: ActionGetResponse = {
    type: "action",
    icon: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1000&auto=format&fit=crop",
    label: "1 SOL",
    title: "Support the Shelter",
    description:
      "Donate SOL to support the animal shelter with a single click.",
    links: {
      actions: [
        {
          type: "transaction",
          label: "1 SOL",
          href: `/api/actions/donate-sol?amount=1`,
        },
        {
          type: "transaction",
          label: "5 SOL",
          href: `/api/actions/donate-sol?amount=5`,
        },
        {
          type: "transaction",
          label: "10 SOL",
          href: `/api/actions/donate-sol?amount=10`,
        },
        {
          type: "transaction",
          href: `/api/actions/donate-sol?amount={amount}`,
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom SOL amount",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  // Return the response with proper headers
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
};

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const amount = parseDonationAmount(url.searchParams.get("amount"));
    if (!amount) {
      return jsonErrorResponse("Invalid amount. Use a number between 0 and 1000 SOL.", 400);
    }

    const requestBody = (await req.json()) as Partial<ActionPostRequest>;
    if (!requestBody.account || typeof requestBody.account !== "string") {
      return jsonErrorResponse("Missing or invalid account in request body.", 400);
    }
    const payer = parsePublicKey(requestBody.account);
    if (!payer) {
      return jsonErrorResponse("Invalid payer account address.", 400);
    }
    const receiver = parsePublicKey(donationWallet);
    if (!receiver) {
      return jsonErrorResponse(
        "Server misconfiguration: invalid SOLANA_DONATION_WALLET.",
        500
      );
    }

    const transaction = await prepareTransaction(connection, payer, receiver, amount);

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
    };

    return Response.json(response, { status: 200, headers });
  } catch (error) {
    console.error("Error processing request:", error);
    return jsonErrorResponse("Internal server error", 500);
  }
};

const prepareTransaction = async (
  connection: Connection,
  payer: PublicKey,
  receiver: PublicKey,
  amount: number
) => {
  const instruction = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: new PublicKey(receiver),
    lamports: amount * LAMPORTS_PER_SOL,
  });

  const { blockhash } = await connection.getLatestBlockhash();

  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [instruction],
  }).compileToV0Message();

  return new VersionedTransaction(message);
};

function resolveBlockchainId(value: string | undefined): string {
  const values = Object.values(BLOCKCHAIN_IDS) as string[];
  if (!value) {
    return DEFAULT_BLOCKCHAIN_ID;
  }
  return values.includes(value) ? value : DEFAULT_BLOCKCHAIN_ID;
}

function parseDonationAmount(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > MAX_SOL_DONATION) {
    return null;
  }
  return parsed;
}

function parsePublicKey(value: string): PublicKey | null {
  try {
    return new PublicKey(value);
  } catch {
    return null;
  }
}

function jsonErrorResponse(message: string, status: number) {
  const payload: ErrorBody = { error: message };
  return new Response(JSON.stringify(payload), { status, headers });
}