CREATE TABLE IF NOT EXISTS "solo_sessions" (
  "id" uuid PRIMARY KEY NOT NULL,
  "owner_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "game_system_id" text NOT NULL,
  "name" text,
  "character_id" uuid,
  "scene_focus" text,
  "game_state" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "journal_entries" (
  "id" uuid PRIMARY KEY NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "solo_sessions"("id") ON DELETE CASCADE,
  "owner_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "solo_sessions_owner_id_idx" ON "solo_sessions" ("owner_id");
CREATE INDEX IF NOT EXISTS "journal_entries_session_id_idx" ON "journal_entries" ("session_id");
CREATE INDEX IF NOT EXISTS "journal_entries_owner_id_idx" ON "journal_entries" ("owner_id");
