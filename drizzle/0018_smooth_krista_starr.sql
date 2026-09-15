CREATE TABLE "community"."audit_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audit_reports_status_check" CHECK ("community"."audit_reports"."status" in ('received', 'reviewing', 'closed'))
);
--> statement-breakpoint
ALTER TABLE "community"."audit_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."users" DROP CONSTRAINT "users_group_check";--> statement-breakpoint
CREATE INDEX "audit_reports_status_created_idx" ON "community"."audit_reports" USING btree ("status","created_at");--> statement-breakpoint
ALTER TABLE "app"."users" ADD CONSTRAINT "users_group_check" CHECK ("app"."users"."group" in ('guest', 'user', 'moderator', 'manager', 'auditor', 'dev'));