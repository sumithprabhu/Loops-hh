// src/core/crypto.ts
// Node/WebCrypto AES-GCM helpers with DTS-safe typings

// --- Utility: always return plain ArrayBuffer (not SharedArrayBuffer) ---
function toArrayBuffer(input: ArrayBuffer | SharedArrayBuffer | Uint8Array): ArrayBuffer {
  if (input instanceof Uint8Array) {
    // Ensure the buffer is an ArrayBuffer, not a SharedArrayBuffer
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength) as ArrayBuffer;
  }
  if (input instanceof SharedArrayBuffer) {
    // Convert SharedArrayBuffer to ArrayBuffer
    return new ArrayBuffer(input.byteLength).slice(0);
  }
  return input; // Already an ArrayBuffer
}

// 1. Generate AES-GCM 256-bit key
export async function generateKey(): Promise<CryptoKey> {
  return await globalThis.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// 2. Export raw key bytes
export async function exportKey(key: CryptoKey): Promise<Uint8Array> {
  const raw = await globalThis.crypto.subtle.exportKey("raw", key);
  return new Uint8Array(toArrayBuffer(raw));
}

// 3. Import key back from raw bytes
export async function importKey(raw: Uint8Array): Promise<CryptoKey> {
  return await globalThis.crypto.subtle.importKey(
    "raw",
    toArrayBuffer(raw),
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

// 4. Encrypt data with random IV
export async function encrypt(
  key: CryptoKey,
  data: Uint8Array
): Promise<{ iv: Uint8Array; data: Uint8Array }> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const enc = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    toArrayBuffer(data)
  );
  return { iv, data: new Uint8Array(toArrayBuffer(enc)) };
}

// 5. Decrypt
export async function decrypt(
  key: CryptoKey,
  payload: { iv: Uint8Array; data: Uint8Array }
): Promise<Uint8Array> {
  const dec = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(payload.iv) }, // Ensure iv is ArrayBuffer
    key,
    toArrayBuffer(payload.data)
  );
  return new Uint8Array(toArrayBuffer(dec));
}