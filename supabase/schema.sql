-- Database setup for 3D Model Web Viewer & AR Platform

-- 1. Create the models table
CREATE TABLE models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  public_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Owners have full access to their own models
CREATE POLICY "own models" ON models FOR ALL USING (auth.uid() = user_id);

-- 4. Policy: Anyone can query models for viewing (needed for the public /view/:id page)
CREATE POLICY "public read models" ON models FOR SELECT USING (true);
