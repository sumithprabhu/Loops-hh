import { createClient, Tagged, AccountData } from "golem-base-sdk";

let _client: Awaited<ReturnType<typeof createClient>> | null = null;

type InitOptions =
  | { privateKey: string }
  | { provider: any };

/**
 * Initialize the GolemDB client.
 */
export async function initClient(opts?: InitOptions) {
  if (_client) return _client;

  const chainId = 60138453033; // Kaolin testnet
  const rpcUrl = "https://ethwarsaw.holesky.golemdb.io/rpc";
  const wsUrl = "wss://ethwarsaw.holesky.golemdb.io/rpc/ws";

  let account: AccountData;

  if (opts && "privateKey" in opts) {
    // Case 1: user provided a private key
    const raw = new Uint8Array(Buffer.from(opts.privateKey.replace(/^0x/, ""), "hex"));
    account = new Tagged<"privatekey", Uint8Array>("privatekey", raw);
  } else if (opts && "provider" in opts) {
    // Case 2: user provided an Ethereum provider (browser wallet)
    account = new Tagged<"ethereumprovider", any>("ethereumprovider", opts.provider);
  } else {
    // Case 3: fallback to .env
    const pkHex = process.env.DBCHAIN_PRIVATE_KEY;
    if (!pkHex) throw new Error("Missing DBCHAIN_PRIVATE_KEY in .env");
    const raw = new Uint8Array(Buffer.from(pkHex.replace(/^0x/, ""), "hex"));
    account = new Tagged<"privatekey", Uint8Array>("privatekey", raw);
  }

  _client = await createClient(chainId, account, rpcUrl, wsUrl);


 
  
  return _client;
}

/**
 * Get the already-initialized client.
 */
export function getClient() {
  if (!_client) throw new Error("Client not initialized. Call initClient() first.");
  return _client;
}
