import { createClient, Tagged, AccountData } from "golem-base-sdk";

let _client: Awaited<ReturnType<typeof createClient>> | null = null;

export async function db() {
  if (_client) return _client;

  const chainId = 60138453033; // Kaolin testnet
  const rpcUrl = "https://kaolin.holesky.golemdb.io/rpc";
  const wsUrl  = "wss://kaolin.holesky.golemdb.io/rpc/ws";

  const pkHex = process.env.DBCHAIN_PRIVATE_KEY;
  if (!pkHex) throw new Error("Missing DBCHAIN_PRIVATE_KEY in .env");

  // strip 0x, convert to Uint8Array
  const raw = new Uint8Array(Buffer.from(pkHex.replace(/^0x/, ""), "hex"));

  // IMPORTANT: tag must be the literal "privatekey" and value must be Uint8Array
  const account: AccountData = new Tagged<"privatekey", Uint8Array>("privatekey", raw);

  _client = await createClient(chainId, account, rpcUrl, wsUrl);
  return _client;
}
