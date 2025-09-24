import { NextResponse } from "next/server";
import { downloadFile } from "shardbase";
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
      return NextResponse.json(
        { error: "bucketId and fileName are required" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    await getSdkClient({privateKey:"3ffd5d53382c90100ed869e277533f9bd3e2cf44cf28e526852f6d9d39e68998"}); // ensure SDK client is ready

    // Create temp directory
    const tempDir = path.join(os.tmpdir(), "edv-downloads");
    await fs.mkdir(tempDir, { recursive: true });
    const filePath = path.join(tempDir, fileName);

    // Use your SDK to download
    await downloadFile(bucketId, fileName, filePath);

    // Read file as buffer
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": fileBuffer.length.toString(),
        "Access-Control-Allow-Origin": "*", // ✅ Allow cross-origin

      },
    });
  } catch (err: any) {
    console.error("❌ Download API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
