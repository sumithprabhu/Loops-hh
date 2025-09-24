import { NextResponse } from "next/server";
import { createBucket, listBuckets } from "shardbase";
import { getSdkClient } from "@/lib/sdk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // or restrict to "http://localhost:3001"
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    await getSdkClient({
      privateKey:
        "0x3ffd5d53382c90100ed869e277533f9bd3e2cf44cf28e526852f6d9d39e68998",
    });
    const buckets = await listBuckets();
    return NextResponse.json(buckets, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    await getSdkClient({
      privateKey:
        "0x3ffd5d53382c90100ed869e277533f9bd3e2cf44cf28e526852f6d9d39e68998",
    });
    const bucket = await createBucket(name);
    return NextResponse.json(bucket, { headers: corsHeaders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: corsHeaders });
  }
}
