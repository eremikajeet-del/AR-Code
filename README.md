# Aura3D - Immersive AR 3D Model Sharing Platform

Aura3D is a production-ready, full-stack web application built using **React, Vite, TypeScript, Tailwind CSS v4, and Supabase**. It allows users to upload 3D models (`.glb` / `.gltf`), automatically upload them to public cloud storage, generate custom QR codes instantly, and view those models in real-time WebXR Augmented Reality (AR) on real-world surfaces.

---

## Prerequisites

- **Node.js**: Version 18.0.0 or higher is required.

---

## Features

1. **Secure Authenticated Hub**: Sign up and sign in using Supabase Auth to protect your 3D assets library.
2. **Smooth 3D Drag & Drop**: Visual dropzone validating file extensions and sizes (supports up to 50MB `.glb`/`.gltf` assets).
3. **Instant QR Code Generation**: Instantly renders custom high-res QR codes pointing directly to sharing URLs.
4. **Immersive WebXR Viewer**: A public, unauthenticated viewer page utilising Google's `<model-viewer>` CDN web component. Scan the QR code to instantly project the 3D model onto physical surfaces (no external application required).
5. **Asset Cleanups**: Integrated cascading delete operations that clean up database records and storage buckets synchronously.

---

## Tech Stack

- **Frontend Core**: React 19, React Router v7, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (incorporating custom glassmorphism effects and modern font-tokens)
- **Backend & Storage**: Supabase Database (PostgreSQL) and Supabase Storage (Public bucket)
- **AR Component**: Google `<model-viewer>` loaded via CDN
- **Utility**: `qrcode` (NPM library) for rendering shareable matrices

---

## Getting Started

### 1. Supabase Database Setup

Go to the [Supabase Dashboard](https://supabase.com), create a new project, navigate to the **SQL Editor**, and run the SQL schema script below to initialize the database:

```sql
-- Create the models table
CREATE TABLE models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Policy: Users can perform all operations on their own records
CREATE POLICY "own models" ON models FOR ALL USING (auth.uid() = user_id);

-- Policy: Allow public read access (Required so public visitors can view shared model links)
CREATE POLICY "public read models" ON models FOR SELECT USING (true);
```

### 2. Storage Bucket Setup

To create the public Storage bucket **`models`**:

1. In your Supabase Dashboard, navigate to **Storage** from the left navigation sidebar.
2. Click **New Bucket** at the top of the pane.
3. Name the bucket **`models`** (all lowercase, exactly as written).
4. **CRITICAL**: Toggle **"Public bucket"** to **ON** (so models can be downloaded by the unauthenticated view page).
5. Click **Create bucket**.
6. (Optional) Under **Allowed MIME types**, you can add `model/gltf-binary` and `model/gltf+json` to restrict file types.

---

## Local Development Configuration

### 1. Environment Setup

Copy the template env and populate it with your Supabase credentials:

```bash
cp .env.example .env
```

Open `.env` and fill in:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Installation & Run Command

Install dependencies and start the Vite local development server:

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Your app will start running at `http://localhost:5173`.

---

## Augmented Reality (AR) Device Support

Aura3D detects hardware capabilities on loading and supports the following environments:
- **Android**: Google Chrome browser via WebXR (allows direct surface tracking and anchoring).
- **iOS (iPhone/iPad)**: Safari browser using Apple AR Quick Look integration (automatically parses and converts to `.usdz` previews).
- **Desktop / Unsupported**: Automatically falls back to a clean 3D interactive viewer canvas and displays the prompt: `"AR not available — enjoy the 3D view"`.

---

## Vercel Deployment Steps

Deploying Aura3D to Vercel takes less than 2 minutes:

1. **Push your code to GitHub**: Create a repository and push your project files.
2. **Connect Repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com) and click **Add New Project**.
   - Select your GitHub repository.
3. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Add Environment Variables**:
   Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Set up SPA Routing** (Redirection fallback):
   We have already included a `vercel.json` file in the root folder to handle clean rewrites and avoid `404` errors when reloading dynamic paths like `/dashboard` or `/view/:id`.
6. Click **Deploy**.
