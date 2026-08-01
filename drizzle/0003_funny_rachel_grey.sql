ALTER TABLE "app"."throttles" DROP CONSTRAINT "throttles_bucket_check";--> statement-breakpoint
ALTER TABLE "app"."throttles" ADD CONSTRAINT "throttles_bucket_check" CHECK ("app"."throttles"."bucket" in ('article', 'comment', 'upload'));--> statement-breakpoint
INSERT INTO "app"."throttles" ("user_id", "bucket", "available_at")
SELECT "id", 'upload', now()
FROM "app"."users"
ON CONFLICT ("user_id", "bucket") DO NOTHING;
