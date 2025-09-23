import "dotenv/config";

import { buckets } from "./src";

async function main() {
  const bucket = await buckets.createBucket("demo-bucket");
  console.log("Created:", bucket);

  const all = await buckets.listBuckets();
  console.log("All buckets:", all);

  const deleted = await buckets.deleteBucket(bucket.id);
  console.log("Deleted:", deleted);
}

main().catch(console.error);
