import { NextResponse } from "next/server";
import { createBucket, listBuckets } from "@sumithprabhu/edv-sdk";
import { getSdkClient } from "@/lib/sdk";

export async function GET() {
  try {
    await getSdkClient({privateKey:"0x3ffd5d53382c90100ed869e277533f9bd3e2cf44cf28e526852f6d9d39e68998"}); // ensure SDK client is ready
    const buckets = await listBuckets();
    return NextResponse.json(buckets);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Bucket name is required" }, { status: 400 });
    }

    await getSdkClient({privateKey:"3ffd5d53382c90100ed869e277533f9bd3e2cf44cf28e526852f6d9d39e68998"}); // ensure SDK client is ready
    const bucket = await createBucket(name);
    return NextResponse.json(bucket);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
