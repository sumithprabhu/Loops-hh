"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BasePage() {
  const [bucketId, setBucketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  // Initialize bucket
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        // 1. Check localStorage for bucket
        const storedBucket = localStorage.getItem("shardbase-bucket");
        if (storedBucket) {
          console.log("✅ Using existing bucket:", storedBucket);
          setBucketId(storedBucket);
          return;
        }

        // 2. Create a new bucket if not found
        const bucketName = `sb-${Date.now()}`;
        const res = await fetch("http://localhost:3001/api/buckets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: bucketName }),
        });

        if (!res.ok) throw new Error("Bucket creation failed");
        const bucket = await res.json();
        setBucketId(bucket.id);

        // 3. Save bucket ID in localStorage
        localStorage.setItem("shardbase-bucket", bucket.id);
        console.log("✅ New bucket created:", bucket.id);
      } catch (err) {
        console.error("❌ Error creating bucket:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Poll file list
  useEffect(() => {
    if (!bucketId) return;
    const fetchFiles = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/files?bucketId=${bucketId}`
        );
        if (res.ok) {
          setFiles(await res.json());
        }
      } catch (err) {
        console.error("❌ Error fetching files", err);
      }
    };
    fetchFiles();
    const interval = setInterval(fetchFiles, 10000);
    return () => clearInterval(interval);
  }, [bucketId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !bucketId) return;
    if (file.type !== "text/plain") {
      alert("Only .txt files allowed");
      return;
    }

    try {
      setUploading(true);
      setStatus(`Uploading ${file.name}...`);

      const formData = new FormData();
      formData.append("bucketId", bucketId);
      formData.append("file", file);

      const res = await fetch("http://localhost:3001/api/files", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");

      const meta = await res.json();
      setFiles((prev) => [...prev, meta]); // update instantly
      setStatus(`✅ Uploaded ${file.name}`);
    } catch (err) {
      console.error(err);
      setStatus("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(fileName: string) {
    if (!bucketId) return;
    try {
      setDownloading(fileName);
      const res = await fetch(
        `http://localhost:3001/api/files/download?bucketId=${bucketId}&fileName=${encodeURIComponent(
          fileName
        )}`
      );
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Download error:", err);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h2 className="text-xl font-bold text-primary">ShardBase</h2>
          <p className="text-sm text-muted-foreground">Base Storage</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {bucketId ? (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bucket</p>
              <p className="font-mono text-sm truncate">{bucketId}</p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No bucket yet</p>
          )}

          <div className="mt-6">
            <p className="text-xs text-muted-foreground mb-2">Files</p>
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files</p>
            ) : (
              <ul className="space-y-1">
                {files.map((f) => (
                  <li
                    key={f.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate">{f.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => handleDownload(f.name)}
                      disabled={downloading === f.name}
                    >
                      {downloading === f.name ? "…" : "↓"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Initiating bucket…</span>
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Bucket Console</h1>

            {/* Upload section */}
            <Card className="bg-card/10 border border-white/40">
              <CardHeader>
                <CardTitle>Upload a File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".txt"
                    id="fileUpload"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <label
                    htmlFor="fileUpload"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-white cursor-pointer hover:bg-primary/80 transition"
                  >
                    <Plus className="h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload .txt"}
                  </label>
                  {status && <p className="text-sm">{status}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Files section */}
            <Card className="bg-card/10 border border-white/40">
              <CardHeader>
                <CardTitle>Files in Bucket</CardTitle>
              </CardHeader>
              <CardContent>
                {files.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No files uploaded yet
                  </p>
                ) : (
                  <ul className="divide-y divide-border/20">
                    {files.map((f) => (
                      <li
                        key={f.name}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="truncate">{f.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(f.name)}
                          disabled={downloading === f.name}
                          className="flex items-center gap-1"
                        >
                          {downloading === f.name ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Downloading…</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </>
                          )}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
