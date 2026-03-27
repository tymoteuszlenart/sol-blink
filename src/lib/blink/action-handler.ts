import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

import { getBlinkRuntimeConfig } from "./config";
import { InMemoryTemplateRepository } from "./repository";
import { seedTemplates } from "./templates";
import { BlinkTemplate } from "./types";

type ErrorBody = { error: string };

const runtime = getBlinkRuntimeConfig();
const connection = new Connection(runtime.rpcUrl);
const repository = new InMemoryTemplateRepository(seedTemplates);

const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": runtime.blockchainId,
  "x-action-version": "2.4",
};

export function optionsResponse() {
  return new Response(null, { headers });
}

export async function getActionBySlug(slug: string) {
  const template = await repository.getBySlug(slug);
  if (!template) {
    return jsonErrorResponse(`Template '${slug}' not found.`, 404);
  }

  const actions = template.amountOptions.map((amount) => ({
    type: "transaction" as const,
    label: `${amount} SOL`,
    href: `/api/actions/${template.slug}?amount=${amount}`,
  }));

  const response: ActionGetResponse = {
    type: "action",
    icon: template.icon,
    label: `${template.defaultAmount} SOL`,
    title: template.title,
    description: template.description,
    links: {
      actions: [
        ...actions,
        {
          type: "transaction",
          href: `/api/actions/${template.slug}?amount={amount}`,
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: template.customAmountLabel,
              type: "number",
            },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  });
}

export async function postActionBySlug(req: Request, slug: string) {
  try {
    const template = await repository.getBySlug(slug);
    if (!template) {
      return jsonErrorResponse(`Template '${slug}' not found.`, 404);
    }

    const url = new URL(req.url);
    const amount = parseDonationAmount(url.searchParams.get("amount"), template.maxAmount);
    if (!amount) {
      return jsonErrorResponse(
        `Invalid amount. Use a number between 0 and ${template.maxAmount} SOL.`,
        400
      );
    }

    const requestBody = (await req.json()) as Partial<ActionPostRequest>;
    if (!requestBody.account || typeof requestBody.account !== "string") {
      return jsonErrorResponse("Missing or invalid account in request body.", 400);
    }
    const payer = parsePublicKey(requestBody.account);
    if (!payer) {
      return jsonErrorResponse("Invalid payer account address.", 400);
    }
    const receiver = parsePublicKey(template.receiver);
    if (!receiver) {
      return jsonErrorResponse("Template configuration error: invalid receiver wallet.", 500);
    }

    const transaction = await prepareTransaction(connection, payer, receiver, amount);

    const response: ActionPostResponse = {
      type: "transaction",
      transaction: Buffer.from(transaction.serialize()).toString("base64"),
    };

    return Response.json(response, { status: 200, headers });
  } catch (error) {
    console.error("Error processing action request:", error);
    return jsonErrorResponse("Internal server error", 500);
  }
}

export async function listTemplates() {
  return repository.listActive();
}

function parseDonationAmount(value: string | null, maxAmount: number): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > maxAmount) {
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

async function prepareTransaction(
  conn: Connection,
  payer: PublicKey,
  receiver: PublicKey,
  amount: number
) {
  const instruction = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: receiver,
    lamports: amount * LAMPORTS_PER_SOL,
  });

  const { blockhash } = await conn.getLatestBlockhash();
  const message = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [instruction],
  }).compileToV0Message();

  return new VersionedTransaction(message);
}

export function serializeTemplateForUi(template: BlinkTemplate) {
  return {
    slug: template.slug,
    title: template.title,
    description: template.description,
    amountOptions: template.amountOptions,
    endpoint: `/api/actions/${template.slug}`,
  };
}
