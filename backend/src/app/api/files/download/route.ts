import { NextResponse } from "next/server";
import { downloadFile } from "@sumithprabhu/edv-sdk";
import { getSdkClient } from "@/lib/sdk";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bucketId = searchParams.get("bucketId");
    const fileName = searchParams.get("fileName");

    if (!bucketId || !fileName) {
      return NextResponse.json({ error: "bucketId and fileName are required" }, { status: 400 });
    }

    await getSdkClient();

    // Temp path to write file before sending it
    const tempDir = path.join(os.tmpdir(), "edv-downloads");
    await fs.mkdir(tempDir, { recursive: true });
    const filePath = path.join(tempDir, fileName);

    await downloadFile(bucketId, fileName, filePath);

    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
