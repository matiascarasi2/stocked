import { describe, expect, it, jest, beforeAll, afterAll } from "@jest/globals";
import type { Server } from "node:http";
import { createApp } from "../app.js";
import type { SymbolRegistry } from "../symbols/symbol-registry.js";

describe("internal routes", () => {
  let server: Server;
  let baseUrl: string;
  const syncSymbol = jest
    .fn<(symbol: string) => Promise<void>>()
    .mockResolvedValue(undefined);

  beforeAll(async () => {
    const registry = { syncSymbol } as unknown as SymbolRegistry;
    const app = createApp(registry);
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Failed to bind test server");
    }
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it("rejects requests without internal secret", async () => {
    const response = await fetch(`${baseUrl}/internal/symbols/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: "AAPL" }),
    });

    expect(response.status).toBe(401);
    expect(syncSymbol).not.toHaveBeenCalled();
  });

  it("syncs symbol when secret is valid", async () => {
    syncSymbol.mockClear();

    const response = await fetch(`${baseUrl}/internal/symbols/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": "test-worker-secret",
      },
      body: JSON.stringify({ symbol: "AAPL" }),
    });

    expect(response.status).toBe(204);
    expect(syncSymbol).toHaveBeenCalledWith("AAPL");
  });
});
