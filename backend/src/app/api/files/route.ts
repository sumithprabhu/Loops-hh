import { NextResponse } from "next/server";
import { uploadFile, listFiles, downloadFile, deleteFile } from "shardbase";
import { getSdkClient } from "@/lib/sdk";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bucketId = searchParams.get("bucketId");
    if (!bucketId) {
      return NextResponse.json({ error: "bucketId is required" }, { status: 400 });
    }

    await getSdkClient();
    const files = await listFiles(bucketId);
    return NextResponse.json(files);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const bucketId = formData.get("bucketId") as string;
    const file = formData.get("file") as File;

    if (!bucketId || !file) {
      return NextResponse.json({ error: "bucketId and file are required" }, { status: 400 });
    }

    // Convert File → Buffer → Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    await getSdkClient();
    const meta = await uploadFile(bucketId, file.name);
    return NextResponse.json(meta);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bucketId = searchParams.get("bucketId");
    const fileName = searchParams.get("fileName");

    if (!bucketId || !fileName) {
      return NextResponse.json({ error: "bucketId and fileName are required" }, { status: 400 });
    }

    await getSdkClient();
    await deleteFile(bucketId, fileName);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
