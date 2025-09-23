/**
 * types/index.ts
 * Shared type definitions for the SDK
 */

/**
 * Bucket represents a logical folder owned by a user.
 */
export interface Bucket {
  id: string;         // unique bucket id (uuid)
  name: string;       // human-readable name
  createdAt: number;  // timestamp (ms since epoch)
}

/**
 * ObjectMeta represents a stored object (file) in a bucket.
 */
export interface FileMeta {
  id: string;          // unique object id (uuid)
  bucketId: string;    // which bucket this belongs to
  name: string;        // file name
  size: number;        // size in bytes
  createdAt: number;   // timestamp (ms since epoch)
}
