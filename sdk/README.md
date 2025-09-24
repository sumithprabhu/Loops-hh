# ShardBase SDK

ShardBase is a decentralized storage SDK powered by GolemDB. It provides simple APIs for creating buckets, uploading, downloading, and managing files in a decentralized and secure way.

---

## Installation

```bash
npm install shardbase
# or
yarn add shardbase
```

---

## Quick Start

```ts
import {
  initClient,
  createBucket,
  listBuckets,
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile,
} from "shardbase";

// Initialize client
await initClient({
  privateKey: process.env.PRIVATE_KEY, // Required
});

// Create a bucket
const bucket = await createBucket("my-bucket");
console.log("Bucket ID:", bucket.id);

// Upload a file
const meta = await uploadFile(bucket.id, "./path/to/file.txt");
console.log("Uploaded file:", meta);
```

---

## API Reference

### initClient(options)

Initializes the ShardBase client.

- **Parameters**:
  - `options.privateKey: string` – private key for authentication.
- **Returns**: `Promise<void>`

---

### createBucket(name)

Creates a new bucket.

- **Parameters**:
  - `name: string` – unique bucket name.
- **Returns**:  
  `Promise<{ id: string; name: string; createdAt: number }>`

---

### listBuckets()

Lists all buckets created by the client.

- **Parameters**: None  
- **Returns**:  
  `Promise<Array<{ id: string; name: string; createdAt: number }>>`

---

### uploadFile(bucketId, filePath)

Uploads a file into a given bucket.

- **Parameters**:
  - `bucketId: string` – ID of the target bucket.
  - `filePath: string` – path of the file to upload.
- **Returns**:  
  `Promise<{ name: string; size: number; bucketId: string; createdAt: number }>`

---

### listFiles(bucketId)

Lists all files inside a bucket.

- **Parameters**:
  - `bucketId: string` – ID of the bucket.
- **Returns**:  
  `Promise<Array<{ name: string; size: number; createdAt: number }>>`

---

### downloadFile(bucketId, fileName, destPath)

Downloads a file from a bucket.

- **Parameters**:
  - `bucketId: string` – ID of the bucket.
  - `fileName: string` – name of the file to download.
  - `destPath: string` – local destination path.
- **Returns**: `Promise<void>`

---

### deleteFile(bucketId, fileName)

Deletes a file from a bucket.

- **Parameters**:
  - `bucketId: string` – ID of the bucket.
  - `fileName: string` – name of the file to delete.
- **Returns**: `Promise<void>`

---

## Example Workflow

```ts
await initClient({ privateKey: process.env.PRIVATE_KEY });

// Create bucket
const bucket = await createBucket("documents");

// Upload file
await uploadFile(bucket.id, "./resume.txt");

// List files
const files = await listFiles(bucket.id);
console.log(files);

// Download file
await downloadFile(bucket.id, "resume.txt", "./downloads/resume.txt");

// Delete file
await deleteFile(bucket.id, "resume.txt");
```

---

## Notes

- Buckets are immutable once created; they cannot be renamed.  
- Files with the same name overwrite existing files in the bucket.  
- Always store private keys in environment variables, not in client-side code.  
