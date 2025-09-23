// utils/toBuffer.ts
export function toBuffer(u8: Uint8Array): ArrayBuffer {
    // Defensive copy into a plain ArrayBuffer
    return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  }
  