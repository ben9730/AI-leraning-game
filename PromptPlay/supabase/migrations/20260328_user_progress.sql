-- user_progress table for PromptPlay cloud sync
-- Run this in Supabase SQL Editor before enabling cloud sync.

CREATE TABLE IF NOT EXISTS user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_total INTEGER NOT NULL DEFAULT 0,
  streak_count INTEGER NOT NULL DEFAULT 0,
  completed_lessons TEXT[] NOT NULL DEFAULT '{}',
  unlocked_lessons TEXT[] NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read their own row
CREATE POLICY "Users can view own progress"
  ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: users can insert their own row
CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can update their own row
CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: users can delete their own row
CREATE POLICY "Users can delete own progress"
  ON user_progress
  FOR DELETE
  USING (auth.uid() = user_id);
