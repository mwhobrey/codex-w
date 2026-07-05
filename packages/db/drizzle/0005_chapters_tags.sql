-- Renaming a table isn't naturally idempotent (unlike the IF NOT EXISTS /
-- ADD COLUMN IF NOT EXISTS used elsewhere), and this whole file replays on
-- every `npm run dev`. Guard it explicitly, and self-heal the phantom empty
-- "solo_sessions" that 0001_solo.sql's CREATE TABLE IF NOT EXISTS would
-- otherwise resurrect on any replay after the rename already happened.
DO $$
BEGIN
  IF to_regclass('public.play_sessions') IS NULL THEN
    IF to_regclass('public.solo_sessions') IS NOT NULL THEN
      ALTER TABLE "solo_sessions" RENAME TO "play_sessions";
    END IF;
  ELSIF to_regclass('public.solo_sessions') IS NOT NULL THEN
    DROP TABLE "solo_sessions";
  END IF;
END $$;

ALTER TABLE "play_sessions" ADD COLUMN IF NOT EXISTS "room_id" text;
ALTER TABLE "play_sessions" ADD COLUMN IF NOT EXISTS "chapter_number" integer;
ALTER TABLE "play_sessions" ADD COLUMN IF NOT EXISTS "status" text;

ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "tags" jsonb;
ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "pinned" boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS "saved_tags" (
  "id" uuid PRIMARY KEY NOT NULL,
  "owner_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "label" text NOT NULL,
  "color" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "last_used_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "play_sessions_room_id_idx" ON "play_sessions" ("room_id");
CREATE INDEX IF NOT EXISTS "saved_tags_owner_id_idx" ON "saved_tags" ("owner_id");
