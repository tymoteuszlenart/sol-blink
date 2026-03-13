import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-indigo-900 text-white">
      <main className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-10 px-6 py-24 text-center">
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold sm:text-5xl">One-Click Crypto Donations</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-200">
            Turn a single click into a Solana donation. This Blink lets donors send SOL directly from social platforms like X/Twitter without needing custom smart contracts.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <a
            className="rounded-full bg-white/10 px-8 py-3 text-sm font-semibold transition hover:bg-white/20"
            href="https://dial.to/"
            target="_blank"
            rel="noreferrer"
          >
            Try it on Dial
          </a>
          <span className="text-sm text-slate-300">
            API: <code className="rounded bg-white/10 px-2 py-1">/api/donate</code>
          </span>
        </div>

        <div className="relative mt-10 w-full max-w-md rounded-3xl border border-white/10 bg-black/30 p-6 shadow-xl shadow-black/40">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Dial Preview</span>
            <span className="text-xs text-slate-300">(mockup)</span>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4">
            <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3">
              <span className="text-sm font-medium text-white">Support the Shelter</span>
              <span className="text-xs text-slate-300">BLINK</span>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-200">
                Tap a button to send SOL instantly — no wallets to configure, just confirm the action in your client.
              </p>
              <div className="flex gap-3">
                <button className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                  1 SOL
                </button>
                <button className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                  5 SOL
                </button>
                <button className="flex-1 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                  10 SOL
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 px-6 py-5 text-left text-sm text-slate-200 shadow-lg shadow-black/20">
          <p className="font-medium text-white">Blink Demo</p>
          <p className="mt-2">Open the link below in a Solana Action-compatible client to simulate the one-click donation flow.</p>
          <pre className="mt-3 overflow-x-auto rounded bg-black/30 px-3 py-2 text-xs">
            https://your-deploy-url.vercel.app/api/actions/donate-sol
          </pre>
        </div>
      </main>
    </div>
  );
}
