import { getClient } from "../lib/client";
import type { Bucket } from "../types";
import { Annotation, GolemBaseCreate } from "golem-base-sdk";

const enc = new TextEncoder();

export async function createBucket(
  name: string
): Promise<Bucket> {
  const client = getClient();

  const payload = enc.encode(JSON.stringify({ name, createdAt: Date.now() }));

  const creates: GolemBaseCreate[] = [
    {
      data: payload,
      btl: 600,
      stringAnnotations: [
        new Annotation("type", "bucket"),
        new Annotation("name", name),
      ],
      numericAnnotations: [],
    },
  ];

  const receipt = await client.createEntities(creates);
  const entityKey = receipt[0].entityKey as string;

  return { id: entityKey, name, createdAt: Date.now() };
}

export async function listBuckets(): Promise<Bucket[]> {
  const client = getClient();
  const dec = new TextDecoder();

  const entities = await client.queryEntities(`type = "bucket"`);

  return entities.map((e) => {
    let name = "unknown";
    let createdAt = Date.now();
    try {
      const obj = JSON.parse(dec.decode(e.storageValue));
      name = obj.name ?? name;
      createdAt = obj.createdAt ?? createdAt;
    } catch {}
    return { id: e.entityKey as string, name, createdAt } as Bucket;
  });
}

export async function deleteBucket(id: string): Promise<boolean> {
  const client = getClient();
  await client.deleteEntities([id as `0x${string}`]);
  return true;
}
