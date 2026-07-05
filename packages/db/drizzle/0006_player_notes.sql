CREATE TABLE IF NOT EXISTS "player_notes" (
  "id" uuid PRIMARY KEY NOT NULL,
  "owner_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "room_id" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "player_notes_owner_room_idx" ON "player_notes" ("owner_id", "room_id");
