import { ActionGetResponse, createActionHeaders, createPostResponse } from '@solana/actions';
import { PublicKey, SystemProgram, Transaction, Connection, clusterApiUrl } from '@solana/web3.js';

const SHELTER_WALLET = new PublicKey('FjAksW7EqEH121RsLzh1YtJXg7X5g7vEn9XJJ1CmZU6M');

export async function GET() {
  const response: ActionGetResponse = {
    title: 'Support the Shelter',
    icon: 'https://via.placeholder.com/100',
    description: 'Donate SOL to support the animal shelter with a single click.',
    label: 'Donate',
    links: {
      actions: [
        {
          type: 'transaction',
          label: '1 SOL',
          href: '/api/donate?amount=1',
        },
        {
          type: 'transaction',
          label: '5 SOL',
          href: '/api/donate?amount=5',
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      ...createActionHeaders(),
    },
  });
}

export async function POST(request: Request) {
  const { publicKey } = (await request.json()) as { publicKey?: string };
  const url = new URL(request.url);
  const amountFromQuery = Number(url.searchParams.get('amount')) || 1;

  if (!publicKey) {
    return new Response(JSON.stringify({ error: 'Missing publicKey in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...createActionHeaders() },
    });
  }

  const donor = new PublicKey(publicKey);
  const lamports = Math.round(amountFromQuery * 1_000_000_000);

  const connection = new Connection(clusterApiUrl('devnet'));
  const { blockhash } = await connection.getLatestBlockhash('finalized');

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: donor,
  }).add(
    SystemProgram.transfer({
      fromPubkey: donor,
      toPubkey: SHELTER_WALLET,
      lamports,
    }),
  );

  const response = await createPostResponse({
    fields: { type: 'transaction', transaction },
  });

  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      ...createActionHeaders(),
    },
  });
}

export async function OPTIONS() {
  return new Response(null, { headers: createActionHeaders() });
}
