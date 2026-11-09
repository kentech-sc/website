CREATE TABLE "app"."game_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"game" text NOT NULL,
	"seed" integer NOT NULL,
	"reaction_state" jsonb,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"completed_score" integer,
	CONSTRAINT "game_sessions_user_game_unique" UNIQUE("user_id","game"),
	CONSTRAINT "game_sessions_game_check" CHECK ("app"."game_sessions"."game" in ('reaction', 'color', 'recycling'))
);

--> statement-breakpoint
ALTER TABLE "app"."game_sessions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE TABLE "app"."game_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"game" text NOT NULL,
	"week" date NOT NULL,
	"score" integer NOT NULL,
	"achieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_records_user_game_week_unique" UNIQUE("user_id","game","week"),
	CONSTRAINT "game_records_game_check" CHECK ("app"."game_records"."game" in ('reaction', 'color', 'recycling')),
	CONSTRAINT "game_records_score_check" CHECK (("app"."game_records"."game" = 'reaction' and "app"."game_records"."score" between 0 and 2000) or ("app"."game_records"."game" in ('color', 'recycling') and "app"."game_records"."score" between 1 and 200))
);

--> statement-breakpoint
ALTER TABLE "app"."game_records" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "app"."game_sessions" ADD CONSTRAINT "game_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "app"."game_records" ADD CONSTRAINT "game_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "game_records_game_week_score_idx" ON "app"."game_records" USING btree ("game","week","score");
