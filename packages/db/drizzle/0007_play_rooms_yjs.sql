CREATE TABLE IF NOT EXISTS "yjs_documents" (
  "name" text PRIMARY KEY NOT NULL,
  "state" bytea NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "room_invites" (
  "room_id" text PRIMARY KEY NOT NULL,
  "token" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "play_rooms" (
  "room_id" text PRIMARY KEY NOT NULL,
  "owner_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text,
  "game_system_id" text,
  "invite_token" text,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "play_rooms_owner_id_idx" ON "play_rooms" ("owner_id");
