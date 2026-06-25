-- character sheet layout + dice sets
ALTER TABLE "character_sheets" ADD COLUMN IF NOT EXISTS "layout" jsonb;

CREATE TABLE IF NOT EXISTS "dice_sets" (
  "id" uuid PRIMARY KEY NOT NULL,
  "owner_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "formulas" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "dice_sets_owner_id_idx" ON "dice_sets" ("owner_id");
