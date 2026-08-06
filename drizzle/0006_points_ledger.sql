CREATE SCHEMA "points";

CREATE TABLE "points"."accounts" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"lifetime_earned" integer DEFAULT 0 NOT NULL,
	"lifetime_spent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_user_id_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade,
	CONSTRAINT "point_accounts_lifetime_earned_check" CHECK ("lifetime_earned" >= 0),
	CONSTRAINT "point_accounts_lifetime_spent_check" CHECK ("lifetime_spent" >= 0)
);

CREATE TABLE "points"."ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"amount" integer NOT NULL,
	"source_type" text,
	"source_id" text,
	"idempotency_key" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_entries_user_id_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade,
	CONSTRAINT "point_ledger_entries_idempotency_key_unique" UNIQUE ("idempotency_key"),
	CONSTRAINT "point_ledger_entries_amount_check" CHECK ("amount" <> 0)
);

CREATE TABLE "points"."daily_event_counts" (
	"user_id" uuid NOT NULL,
	"date_key" date NOT NULL,
	"event_type" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_event_counts_user_id_date_key_event_type_pk"
		PRIMARY KEY ("user_id", "date_key", "event_type"),
	CONSTRAINT "daily_event_counts_user_id_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade,
	CONSTRAINT "point_daily_event_counts_count_check" CHECK ("count" >= 0)
);

CREATE INDEX "point_ledger_entries_user_created_idx"
	ON "points"."ledger_entries" USING btree ("user_id", "created_at");
CREATE INDEX "point_ledger_entries_event_type_idx"
	ON "points"."ledger_entries" USING btree ("event_type");

INSERT INTO "points"."accounts"
	("user_id", "balance", "lifetime_earned", "lifetime_spent", "created_at", "updated_at")
SELECT
	"id",
	"points",
	GREATEST("points", 0),
	GREATEST(-"points", 0),
	"created_at",
	"updated_at"
FROM "app"."users";

INSERT INTO "points"."ledger_entries"
	("user_id", "event_type", "amount", "source_type", "source_id", "idempotency_key", "metadata", "created_at")
SELECT
	"id",
	'legacy.balance',
	"points",
	'migration',
	"id"::text,
	'legacy.balance:' || "id"::text,
	jsonb_build_object('migration', '0006_points_ledger'),
	now()
FROM "app"."users"
WHERE "points" <> 0;

INSERT INTO "points"."daily_event_counts"
	("user_id", "date_key", "event_type", "count", "created_at", "updated_at")
SELECT "user_id", "date_key", 'post.created', "post_count", "created_at", "updated_at"
FROM "app"."point_states" WHERE "post_count" > 0
UNION ALL
SELECT "user_id", "date_key", 'comment.created', "comment_count", "created_at", "updated_at"
FROM "app"."point_states" WHERE "comment_count" > 0
UNION ALL
SELECT "user_id", "date_key", 'review.created', "review_count", "created_at", "updated_at"
FROM "app"."point_states" WHERE "review_count" > 0
UNION ALL
SELECT "user_id", "date_key", 'petition.created', "petition_count", "created_at", "updated_at"
FROM "app"."point_states" WHERE "petition_count" > 0;

ALTER TABLE "points"."accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "points"."ledger_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "points"."daily_event_counts" ENABLE ROW LEVEL SECURITY;

DROP TABLE "app"."point_states";
ALTER TABLE "app"."users" DROP COLUMN "points";
