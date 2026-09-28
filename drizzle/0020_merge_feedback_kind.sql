ALTER TABLE "community"."submissions" DROP CONSTRAINT "submissions_kind_check";--> statement-breakpoint
ALTER TABLE "community"."submissions" DROP CONSTRAINT "submissions_category_check";--> statement-breakpoint
UPDATE "community"."submissions" SET "kind" = 'feedback' WHERE "kind" in ('inquiry', 'suggestion');--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD CONSTRAINT "submissions_kind_check" CHECK ("community"."submissions"."kind" in ('petition', 'feedback'));--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD CONSTRAINT "submissions_category_check" CHECK (("community"."submissions"."kind" = 'petition' and "community"."submissions"."category" is null) or ("community"."submissions"."kind" = 'feedback' and "community"."submissions"."category" is not null and "community"."submissions"."category" in ('executive', 'education', 'clubs', 'audit', 'election', 'website', 'other')));
