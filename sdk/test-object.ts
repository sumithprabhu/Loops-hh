import "dotenv/config";
import { generateKey, exportKey, importKey, encrypt, decrypt } from "./src/core/crypto";
import { createBucket, listBuckets, deleteBucket } from "./src/db/buckets";
import { db } from "./src/lib/db";
import { Annotation } from "golem-base-sdk";
import { initClient , getClient} from "./src/lib/client";



async function main() {
  await initClient()
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  // --- 1. simulate input file ---
  const input = enc.encode("This is a top secret message 👀 with emojis 🚀🔥");
  console.log("📦 original:", input, "->", dec.decode(input));

  // --- 2. generate key + chunk data ---
  const key = await generateKey();
  const exportedKey = await exportKey(key);
  console.log("🔑 AES key (hex):", Buffer.from(exportedKey).toString("hex"));

  const chunkSize = 16; // bytes, small for demo
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < input.length; i += chunkSize) {
    chunks.push(input.slice(i, i + chunkSize));
  }
  console.log("✂️ chunks:", chunks);

  // --- 3. encrypt each chunk ---
  const encryptedChunks: { iv: Uint8Array; data: Uint8Array }[] = [];
  for (const c of chunks) {
    const e = await encrypt(key, c);
    encryptedChunks.push(e);
  }
  console.log("🔒 encrypted chunks:", encryptedChunks);

  // --- 4. push object metadata to DB-Chain ---
  const bucket = await createBucket("object-demo");
  console.log("🪣 bucket created:", bucket);

  const client = await getClient();
  const manifest = {
    name: "secret.txt",
    chunks: encryptedChunks.map((c, i) => ({
      index: i,
      iv: Buffer.from(c.iv).toString("hex"),
      dataHex: Buffer.from(c.data).toString("hex"),
    })),
    createdAt: Date.now(),
  };

  await client.createEntities([
    {
      data: enc.encode(JSON.stringify(manifest)),
      btl: 600,
      stringAnnotations: [
        new Annotation("type", "object"),
        new Annotation("bucketId", bucket.id),
        new Annotation("name", manifest.name),
      ],
      numericAnnotations: [],
    },
  ]);
  console.log("⬆️ object manifest pushed:", manifest);

  // --- 5. fetch object back ---
  const objs = await client.queryEntities(`type = "object" && bucketId = "${bucket.id}"`);
  const stored = JSON.parse(dec.decode(objs[0].storageValue));
  console.log("⬇️ fetched manifest:", stored);

  // --- 6. decrypt + rejoin ---
  const decryptedChunks: Uint8Array[] = [];
  for (const c of stored.chunks) {
    const iv = Uint8Array.from(Buffer.from(c.iv, "hex"));
    const data = Uint8Array.from(Buffer.from(c.dataHex, "hex"));
    const d = await decrypt(key, { iv, data });
    decryptedChunks.push(d);
  }

  // join chunks
  const joined = new Uint8Array(decryptedChunks.reduce((a, c) => a + c.length, 0));
  let offset = 0;
  for (const c of decryptedChunks) {
    joined.set(c, offset);
    offset += c.length;
  }

  console.log("🔓 decrypted chunks:", decryptedChunks);
  console.log("📖 final rejoined:", joined, "->", dec.decode(joined));

  // cleanup
  await deleteBucket(bucket.id);
  console.log("🧹 bucket deleted");
}

main().catch(console.error);
