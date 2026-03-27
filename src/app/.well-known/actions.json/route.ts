import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

const payload: ActionsJson = {
  rules: [
    {
      pathPattern: "/*",
      apiPath: "/api/actions/*",
    },
    {
      pathPattern: "/api/actions/**",
      apiPath: "/api/actions/**",
    },
  ],
};

export const GET = async () =>
  Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });

export const OPTIONS = GET;
