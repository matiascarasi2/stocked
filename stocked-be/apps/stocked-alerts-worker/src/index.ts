import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./lib/env.js";
import { FinnhubTradesSocket } from "./finnhub/trades-socket.js";
import { SymbolRegistry } from "./symbols/symbol-registry.js";
import { AlertMatcher } from "./alerts/alert-matcher.js";

async function main(): Promise<void> {
  const finnhub = new FinnhubTradesSocket();
  const registry = new SymbolRegistry(finnhub);
  const matcher = new AlertMatcher();

  finnhub.onTrade((tick) => {
    void matcher.handleTrade(tick.symbol, tick.price).catch((error) => {
      console.error("[matcher] handleTrade failed", error);
    });
  });

  finnhub.connect();
  await registry.reconcileAll();

  const app = createApp(registry);
  app.listen(env.port, () => {
    console.log(`@stocked/alerts-worker listening on port ${env.port}`);
  });

  const shutdown = (): void => {
    finnhub.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
