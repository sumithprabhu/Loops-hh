import { NextResponse } from "next/server";
import { uploadFile, listFiles, deleteFile } from "shardbase";
import { getSdkClient } from "@/lib/sdk";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // change to "http://localhost:3000" for stricter security
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// --- OPTIONS handler (preflight) ---
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// --- GET list files ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bucketId = searchParams.get("bucketId");
    if (!bucketId) {
      return NextResponse.json(
        { error: "bucketId is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    await getSdkClient();
    const files = await listFiles(bucketId);
    return NextResponse.json(files, { headers: corsHeaders });
  }catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500, headers: corsHeaders }
      );
    }
  
    return NextResponse.json(
      { error: String(err) },
      { status: 500, headers: corsHeaders }
    );
  }
  
}

// --- POST upload file ---
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const bucketId = formData.get("bucketId") as string;
    const file = formData.get("file") as File;

    if (!bucketId || !file) {
      return NextResponse.json(
        { error: "bucketId and file are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempPath = path.join(os.tmpdir(), file.name);
    await fs.writeFile(tempPath, buffer);

    await getSdkClient({
      privateKey:
        "0x3ffd5d53382c90100ed869e277533f9bd3e2cf44cf28e526852f6d9d39e68998",
    });
    const meta = await uploadFile(bucketId, tempPath);

    return NextResponse.json(meta, { headers: corsHeaders });
  } catch (err: unknown) {
    console.error("❌ Upload API Error:", err);
  
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500, headers: corsHeaders }
      );
    }
  
    return NextResponse.json(
      { error: String(err) },
      { status: 500, headers: corsHeaders }
    );
  }
  
}

// --- DELETE file ---
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bucketId = searchParams.get("bucketId");
    const fileName = searchParams.get("fileName");

    if (!bucketId || !fileName) {
      return NextResponse.json(
        { error: "bucketId and fileName are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    await getSdkClient();
    await deleteFile(bucketId, fileName);
    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json(
        { error: err.message },
        { status: 500, headers: corsHeaders }
      );
    }
  
    return NextResponse.json(
      { error: String(err) },
      { status: 500, headers: corsHeaders }
    );
  }
  
}
