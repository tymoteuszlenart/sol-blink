import { describe, expect, it } from "vitest";

import { GET, OPTIONS, POST } from "./route";
import {
  getActionBySlug,
  postActionBySlug,
} from "../../../../lib/blink/action-handler";

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

  it("returns 404 for unknown template slug on GET", async () => {
    const response = await getActionBySlug("missing-template");
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toMatch(/not found/i);
  });

  it("returns 404 for unknown template slug on POST", async () => {
    const request = new Request(
      "http://localhost:3000/api/actions/missing-template?amount=1",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          account: "11111111111111111111111111111111",
        }),
      }
    );

    const response = await postActionBySlug(request, "missing-template");
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toMatch(/not found/i);
  });
});
