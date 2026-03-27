import { listTemplates, serializeTemplateForUi } from "../lib/blink/action-handler";

export default async function Home() {
  const templates = (await listTemplates()).map(serializeTemplateForUi);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-indigo-900 text-white">
      <main className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-10 px-6 py-20 text-center">
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold sm:text-5xl">Blink Wrapper Builder</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-200">
            Build configurable Solana Action templates with shared backend logic. Add a new
            wrapper template by data, not by creating a new route file.
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
            Discovery:{" "}
            <code className="rounded bg-white/10 px-2 py-1">/.well-known/actions.json</code>
          </span>
        </div>

        <div className="grid w-full gap-4 text-left">
          {templates.map((template) => (
            <div
              key={template.slug}
              className="rounded-2xl border border-white/10 bg-white/10 px-6 py-5 text-sm text-slate-200 shadow-lg shadow-black/20"
            >
              <p className="text-base font-semibold text-white">{template.title}</p>
              <p className="mt-1">{template.description}</p>
              <p className="mt-3">
                Endpoint:{" "}
                <code className="rounded bg-black/30 px-2 py-1 text-xs">{template.endpoint}</code>
              </p>
              <p className="mt-2">
                Dial URL:{" "}
                <code className="rounded bg-black/30 px-2 py-1 text-xs">
                  https://dial.to/?action=solana-action:https://your-deploy-url.vercel.app
                  {template.endpoint}
                </code>
              </p>
              <p className="mt-2 text-xs text-slate-300">
                Presets: {template.amountOptions.join(", ")} SOL
              </p>
            </div>
          ))}
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-black/30 px-6 py-5 text-left text-sm text-slate-200">
          <p className="font-medium text-white">Builder Roadmap (DB-ready)</p>
          <p className="mt-2">
            Next step is replacing seed templates with a database-backed repository while keeping
            these same dynamic endpoints.
          </p>
        </div>
      </main>
    </div>
  );
}
