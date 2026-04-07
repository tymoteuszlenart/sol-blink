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

import { getBlinkRuntimeConfig, validateProductionConfig } from "./config";
import { InMemoryTemplateRepository } from "./repository";
import { getSeedTemplates } from "./templates";
import { BlinkTemplate } from "./types";

type ErrorBody = { error: string };

let _templateRepo: InMemoryTemplateRepository | null = null;

function templateRepository() {
  if (!_templateRepo) {
    _templateRepo = new InMemoryTemplateRepository(getSeedTemplates());
  }
  return _templateRepo;
}

let _apiServices: {
  connection: Connection;
  repository: InMemoryTemplateRepository;
  headers: Record<string, string>;
} | null = null;

function apiServices() {
  if (!_apiServices) {
    validateProductionConfig();
    const runtime = getBlinkRuntimeConfig();
    _apiServices = {
      connection: new Connection(runtime.rpcUrl),
      repository: templateRepository(),
      headers: {
        ...ACTIONS_CORS_HEADERS,
        "x-blockchain-ids": runtime.blockchainId,
        "x-action-version": "2.4",
      },
    };
  }
  return _apiServices;
}

export function optionsResponse() {
  const { headers } = apiServices();
  return new Response(null, { headers });
}

export async function getActionBySlug(slug: string) {
  const { repository, headers } = apiServices();
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
    const { repository, connection, headers } = apiServices();
    const template = await repository.getBySlug(slug);
    if (!template) {
      return jsonErrorResponse(`Template '${slug}' not found.`, 404);
    }

    const url = new URL(req.url);
    const amount = parseDonationAmount(url.searchParams.get("amount"), template.maxAmount);
    if (!amount) {
      return jsonErrorResponse(
        `Invalid amount. Use a positive number up to ${template.maxAmount} SOL with at most 9 decimal places.`,
        400
      );
    }

    let requestBody: Partial<ActionPostRequest>;
    try {
      requestBody = (await req.json()) as Partial<ActionPostRequest>;
    } catch {
      return jsonErrorResponse("Invalid JSON in request body.", 400);
    }
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
  return templateRepository().listActive();
}

function parseDonationAmount(value: string | null, maxAmount: number): number | null {
  if (!value) {
    return null;
  }
  if (!/^\d+(\.\d{1,9})?$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > maxAmount) {
    return null;
  }
  const lamports = Math.round(parsed * LAMPORTS_PER_SOL);
  if (lamports <= 0) {
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
  const { headers } = apiServices();
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
    lamports: Math.round(amount * LAMPORTS_PER_SOL),
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
