// Isomorphic chunking + joining (browser & Node 18+)
// - Splits plaintext into ≤chunkSize pieces (default ~120 KB)
// - Computes SHA-256 of the full plaintext for lossless verification
// - Joins chunks back to original bytes; returns Blob in browser, ArrayBuffer in Node

export type ChunkResult = { chunks: Uint8Array[]; plaintextHash: string };

const DEFAULT_CHUNK_SIZE = 120_000;

// --- helpers ---
function isBrowser() {
  return typeof window !== "undefined" && typeof window.Blob !== "undefined";
}

async function toArrayBuffer(input: ArrayBuffer | Blob): Promise<ArrayBuffer> {
  if (input instanceof ArrayBuffer) return input;
  // Blob path (browser or Node's undici Blob)
  return await (input as Blob).arrayBuffer();
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  // In Node 18+ and modern browsers, globalThis.crypto.subtle exists
  const subtle = (globalThis as any).crypto?.subtle;
  if (!subtle) throw new Error("WebCrypto SubtleCrypto not available (need Node 18+ or a browser)");
  const digest = await subtle.digest("SHA-256", bytes);
  const view = new Uint8Array(digest);
  return [...view].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// --- API ---

/**
 * Split input into fixed-size chunks and compute a plaintext SHA-256.
 */
export async function chunkData(
  input: ArrayBuffer | Blob,
  opts?: { chunkSize?: number }
): Promise<ChunkResult> {
  const chunkSize = Math.max(1, opts?.chunkSize ?? DEFAULT_CHUNK_SIZE);
  const ab = await toArrayBuffer(input);
  const bytes = new Uint8Array(ab);

  const chunks: Uint8Array[] = [];
  for (let off = 0; off < bytes.length; off += chunkSize) {
    const end = Math.min(off + chunkSize, bytes.length);
    chunks.push(bytes.subarray(off, end));
  }

  const plaintextHash = await sha256Hex(bytes);
  return { chunks, plaintextHash };
}

/**
 * Join chunks back to a single payload.
 * - Browser: returns Blob (use .stream() or .arrayBuffer())
 * - Node: returns ArrayBuffer
 */
export function joinChunks(
  chunks: Uint8Array[],
  opts?: { mime?: string; filename?: string }
): Blob | ArrayBuffer {
  // Concatenate efficiently
  const total = chunks.reduce((n, c) => n + c.byteLength, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }

  if (isBrowser()) {
    return new Blob([merged], { type: opts?.mime || "application/octet-stream" });
  } else {
    // Node: return ArrayBuffer so callers can Buffer.from(result) if needed
    return merged.buffer;
  }
}
