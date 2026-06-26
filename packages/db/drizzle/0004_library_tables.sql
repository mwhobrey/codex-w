CREATE TABLE IF NOT EXISTS "library_tables" (
  "id" uuid PRIMARY KEY NOT NULL,
  "owner_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "system_id" text,
  "category" text NOT NULL,
  "description" text,
  "rows" jsonb NOT NULL,
  "source_template_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "library_tables_owner_id_idx" ON "library_tables" ("owner_id");
