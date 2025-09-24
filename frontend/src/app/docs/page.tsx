"use client";
import { useState } from "react";
import { Zap, Code, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Docs = () => {
  const [activeSection, setActiveSection] = useState("getting-started");

  const sidebarItems = [
    { id: "getting-started", title: "Getting Started", icon: Zap },
    { id: "methods", title: "Methods", icon: Code },
    { id: "working", title: "Working", icon: Database },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "getting-started":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4 bg-primary bg-clip-text text-transparent">
                Getting Started with ShardBase
              </h1>
              <p className="text-lg text-foreground">
                ShardBase is a decentralized storage SDK powered by GolemenDB.
                With just a few steps, you can create buckets, upload files, and
                query them securely.
              </p>
            </div>

            {/* Installation */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>Installation</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  Install ShardBase via your favorite package manager:
                </p>
                <pre className="bg-black/40 p-4 rounded text-foreground text-sm">
                  {`npm install shardbase\n# or\nyarn add shardbase\n# or\npnpm add shardbase`}
                </pre>
              </CardContent>
            </Card>

            {/* Initialization */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>Initialize Client</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  Before using any methods, initialize the client with your
                  Ethereum private key.
                </p>
                <pre className="bg-black/40 p-4 rounded text-foreground text-sm">
                  {`import { initClient } from "shardbase";\n\nawait initClient({\nprivateKey: process.env.PRIVATE_KEY\n});`}
                </pre>
              </CardContent>
            </Card>

            {/* First Bucket & Upload */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>Create Bucket & Upload File</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="text-muted-foreground">
                  Once initialized, you can create a bucket and upload files
                  into it:
                </p>
                <pre className="bg-black/40 p-4 rounded text-foreground text-sm">
                  {`import { createBucket, uploadFile } from "shardbase";\n\n// Create a new bucket\nconst bucket = await createBucket("my-first-bucket");\n\n// Upload a file into that bucket\nconst fileMeta = await uploadFile(bucket.id, "hello.txt");\nconsole.log("Uploaded file:", fileMeta);`}
                </pre>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <ul className="list-disc ml-6 space-y-1">
                  <li>
                    Explore the <code>listBuckets()</code> and{" "}
                    <code>listFiles()</code> methods
                  </li>
                  <li>
                    Learn how to <code>downloadFile()</code> and{" "}
                    <code>deleteFile()</code>
                  </li>
                  <li>
                    Check <strong>Working with GolemenDB</strong> to understand
                    the database layer
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case "methods":
        return (
          <div className="space-y-8">
            <h1 className="text-4xl font-bold mb-4 bg-primary bg-clip-text text-transparent">ShardBase Methods</h1>
            <p className="text-lg text-foreground mb-6">
              Below are the core functions exposed by the SDK with their
              parameters and return values.
            </p>

            {/* initClient */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>initClient(options)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground space-y-2">
                <p>Initializes the ShardBase client.</p>
                <p>
                  <strong>Parameters:</strong>
                </p>
                <ul className="list-disc ml-5">
                  <li>
                    <code>privateKey: string</code> – Ethereum private key for
                    authentication
                  </li>
                </ul>
                <p>
                  <strong>Returns:</strong> Initialized client instance
                </p>
              </CardContent>
            </Card>

            {/* getClient */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>getClient()</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground space-y-2">
                <p>Retrieves the currently initialized client instance.</p>
                <p>
                  <strong>Returns:</strong> ShardBase client instance
                </p>
              </CardContent>
            </Card>

            {/* createBucket */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>createBucket(name)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground space-y-2">
                <p>Creates a new decentralized bucket.</p>
                <p>
                  <strong>Parameters:</strong>
                </p>
                <ul className="list-disc ml-5">
                  <li>
                    <code>name: string</code> – Human-readable bucket name
                  </li>
                </ul>
                <p>
                  <strong>Returns:</strong> Object containing bucket{" "}
                  <code>id</code> and metadata
                </p>
              </CardContent>
            </Card>

            {/* listBuckets */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>listBuckets()</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground space-y-2">
                <p>Lists all available buckets for the authenticated client.</p>
                <p>
                  <strong>Returns:</strong> Array of bucket objects
                </p>
              </CardContent>
            </Card>

            {/* uploadFile */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>uploadFile(bucketId, file)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground space-y-2">
                <p>Uploads a file to a specific bucket.</p>
                <p>
                  <strong>Parameters:</strong>
                </p>
                <ul className="list-disc ml-5">
                  <li>
                    <code>bucketId: string</code> – Target bucket identifier
                  </li>
                  <li>
                    <code>file: File | Buffer | Uint8Array</code> – File object
                    or binary data
                  </li>
                </ul>
                <p>
                  <strong>Returns:</strong> File metadata object
                </p>
              </CardContent>
            </Card>

            {/* downloadFile */}
            <Card className="bg-card/10 border border-white/20">
              <CardHeader>
                <CardTitle>downloadFile(bucketId, fileName)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground space-y-2">
                <p>Downloads a file from the specified bucket.</p>
                <p>
                  <strong>Parameters:</strong>
                </p>
                <ul className="list-disc ml-5">
                  <li>
                    <code>bucketId: string</code> – Bucket ID
                  </li>
                  <li>
                    <code>fileName: string</code> – Name of the file to download
                  </li>
                </ul>
                <p>
                  <strong>Returns:</strong> File contents as <code>Buffer</code>{" "}
                  or <code>Uint8Array</code>
                </p>
              </CardContent>
            </Card>

            {/* deleteFile */}
            <Card className="bg-card/10 border border-border/20">
              <CardHeader>
                <CardTitle>deleteFile(bucketId, fileName)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground space-y-2">
                <p>Deletes a file from a bucket.</p>
                <p>
                  <strong>Parameters:</strong>
                </p>
                <ul className="list-disc ml-5">
                  <li>
                    <code>bucketId: string</code> – Bucket ID
                  </li>
                  <li>
                    <code>fileName: string</code> – File name to delete
                  </li>
                </ul>
                <p>
                  <strong>Returns:</strong> Confirmation object
                </p>
              </CardContent>
            </Card>
          </div>
        );

        case "working":
          return (
            <div className="space-y-6">
              <h1 className="text-4xl font-bold mb-4 bg-primary bg-clip-text text-transparent">
                Working with GolemenDB
              </h1>
              <p className="text-lg text-foreground">
                GolemenDB is the decentralized metadata database that powers ShardBase.
                It serves as a registry for <strong>buckets</strong>, <strong>files</strong>, 
                and <strong>access rules</strong>, ensuring that every action is tracked 
                transparently and securely across the network.
              </p>
        
              {/* How It Works */}
              <Card className="bg-card/10 border border-white/40">
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-foreground space-y-3">
                  <p>
                    • Every bucket and file operation (<code>create</code>,{" "}
                    <code>upload</code>, <code>delete</code>) is immutably recorded in
                    GolemenDB.
                  </p>
                  <p>
                    • Data is replicated across multiple nodes to guarantee{" "}
                    <strong>high availability</strong> and <strong>fault tolerance</strong>.
                  </p>
                  <p>
                    • Queries such as <code>listBuckets</code> or <code>listFiles</code>{" "}
                    are resolved instantly using GolemenDB’s indexed metadata layer.
                  </p>
                  <p>
                    • Ownership, permissions, and access policies are validated at the
                    database level, providing a trusted source of truth.
                  </p>
                  <p>
                    • Consensus ensures that no single node can tamper with records,
                    aligning with the decentralized principles of ShardBase.
                  </p>
                </CardContent>
              </Card>
        
              {/* Why It Matters */}
              <Card className="bg-card/10 border border-white/40">
                <CardHeader>
                  <CardTitle>Why It Matters</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-foreground space-y-3">
                  <p>• Guarantees integrity and immutability of all operations.</p>
                  <p>• Enables decentralized, permission-aware querying at scale.</p>
                  <p>
                    • Provides full auditability with{" "}
                    <strong>tamper-resistant history</strong> of all actions.
                  </p>
                  <p>• Removes dependency on centralized metadata servers.</p>
                  <p>
                    • Makes ShardBase suitable for{" "}
                    <strong>enterprise-grade storage use cases</strong> where compliance
                    and verifiability are essential.
                  </p>
                </CardContent>
              </Card>
        
              {/* Developer Notes */}
              <Card className="bg-card/10 border border-white/40">
                <CardHeader>
                  <CardTitle>Developer Notes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-foreground space-y-3">
                  <p>
                    • Use <code>initClient()</code> before making queries to ensure you
                    are connected to GolemenDB nodes.
                  </p>
                  <p>
                    • Queries like <code>listBuckets()</code> and <code>listFiles()</code>{" "}
                    are lightweight since they only pull metadata, not the entire file
                    contents.
                  </p>
                  <p>
                    • For advanced workflows, GolemenDB supports{" "}
                    <strong>access rules</strong> that restrict who can read/write to a
                    bucket or file.
                  </p>
                </CardContent>
              </Card>
            </div>
          );
        

      default:
        return <div className="text-foreground">Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-sidebar border-r border-sidebar-border min-h-screen">
          <div className="p-6 border-b border-sidebar-border">
            <h2 className="text-2xl font-bold text-primary mb-1">ShardBase</h2>
            <p className="text-sm text-muted-foreground">Documentation</p>
          </div>

          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-10 px-3 text-sm font-medium transition-colors"
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Docs;
