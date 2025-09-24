// lib/sdk.ts
import { initClient } from "shardbase";

let initialized = false;

export async function getSdkClient(opts?: { signer?: any; privateKey?: string }) {
  if (!initialized) {
    if (opts?.signer) {
      // Frontend signer (RainbowKit/wallet)
      await initClient({ provider: opts.signer });
    } else if (opts?.privateKey || process.env.DBCHAIN_PRIVATE_KEY) {
      // Backend private key (env or passed directly)
      const pk = opts?.privateKey ?? process.env.DBCHAIN_PRIVATE_KEY!;
      console.log("Using private key for SDK client init:", pk.slice(0, 6) + "..." + pk.slice(-4));
      await initClient({ privateKey: pk });
    } else {
      throw new Error("No signer or private key provided for SDK client init");
    }
    initialized = true;
  }
  return true;
}
