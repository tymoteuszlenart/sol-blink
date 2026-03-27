import { describe, expect, it } from "vitest";

import { GET, OPTIONS, POST } from "./route";

describe("donate-sol action route", () => {
  it("returns blink metadata from GET", async () => {
    const response = await GET(
      new Request("http://localhost:3000/api/actions/donate-sol")
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.type).toBe("action");
    expect(payload.links.actions.length).toBeGreaterThan(0);
  });

  it("returns action headers for OPTIONS", async () => {
    const response = await OPTIONS();

    expect(response.headers.get("x-action-version")).toBe("2.4");
    expect(response.headers.get("x-blockchain-ids")).toBeTruthy();
  });

  it("rejects invalid amount in POST", async () => {
    const request = new Request(
      "http://localhost:3000/api/actions/donate-sol?amount=0",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          account: "11111111111111111111111111111111",
        }),
      }
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Invalid amount/i);
  });

  it("rejects invalid payer account in POST", async () => {
    const request = new Request(
      "http://localhost:3000/api/actions/donate-sol?amount=1",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          account: "not-a-valid-public-key",
        }),
      }
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Invalid payer account/i);
  });
});
