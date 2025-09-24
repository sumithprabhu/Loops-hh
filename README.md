# ShardBase Monorepo (Master Branch)

This repository is the **master branch** that contains all the components of the ShardBase project.

---

## Repository Structure

```
.
├── sdk/        # ShardBase SDK (npm package)
├── backend/    # Backend APIs built with Next.js App Router
├── frontend/   # Frontend UI built with Next.js and TailwindCSS
└── README.md   # Project documentation
```

---

## Overview

- **/sdk**  
  Contains the decentralized storage SDK powered by GolemDB. This is the npm package (`shardbase`) that developers install and use in their projects.

- **/backend**  
  Contains API routes for handling bucket and file operations. Built on top of Next.js App Router with endpoints for:
  - Creating and listing buckets
  - Uploading and downloading files
  - Listing and deleting files

- **/frontend**  
  Contains the UI for ShardBase. Built with Next.js, TailwindCSS, and shadcn/ui.  
  Includes:
  - Home page with hero section
  - Docs page with full SDK documentation
  - Base console to interact with buckets and files (upload, list, download)


---
