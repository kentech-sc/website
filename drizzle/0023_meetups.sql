CREATE TABLE "app"."meetups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"title" text NOT NULL,
	"mode" text NOT NULL,
	"days" text[] NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meetups_mode_check" CHECK ("app"."meetups"."mode" in ('dates', 'weekdays')),
	CONSTRAINT "meetups_days_check" CHECK (cardinality("app"."meetups"."days") between 1 and 14),
	CONSTRAINT "meetups_time_check" CHECK ("app"."meetups"."start_minute" >= 0 and "app"."meetups"."end_minute" <= 1440 and "app"."meetups"."start_minute" < "app"."meetups"."end_minute" and "app"."meetups"."start_minute" % 30 = 0 and "app"."meetups"."end_minute" % 30 = 0)
);
--> statement-breakpoint
ALTER TABLE "app"."meetups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."meetup_responses" (
	"meetup_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"slots" integer[] DEFAULT '{}'::integer[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meetup_responses_meetup_id_user_id_pk" PRIMARY KEY("meetup_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "app"."meetup_responses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."meetups" ADD CONSTRAINT "meetups_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."meetup_responses" ADD CONSTRAINT "meetup_responses_meetup_id_meetups_id_fk" FOREIGN KEY ("meetup_id") REFERENCES "app"."meetups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."meetup_responses" ADD CONSTRAINT "meetup_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meetups_creator_idx" ON "app"."meetups" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "meetup_responses_user_idx" ON "app"."meetup_responses" USING btree ("user_id");
