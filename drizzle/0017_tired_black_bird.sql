ALTER TABLE "community"."petition_files" RENAME TO "submission_files";--> statement-breakpoint
ALTER TABLE "community"."petition_signatures" RENAME TO "submission_supports";--> statement-breakpoint
ALTER TABLE "community"."petitions" RENAME TO "submissions";--> statement-breakpoint
ALTER TABLE "community"."submission_files" RENAME COLUMN "petition_id" TO "submission_id";--> statement-breakpoint
ALTER TABLE "community"."submission_supports" RENAME COLUMN "petition_id" TO "submission_id";--> statement-breakpoint
ALTER TABLE "community"."submissions" RENAME COLUMN "petitioner_id" TO "author_id";--> statement-breakpoint
ALTER TABLE "community"."submissions" DROP CONSTRAINT "petitions_status_check";--> statement-breakpoint
ALTER TABLE "community"."submissions" DROP CONSTRAINT "petitions_view_count_check";--> statement-breakpoint
ALTER TABLE "community"."submission_files" DROP CONSTRAINT "petition_files_petition_id_petitions_id_fk";
--> statement-breakpoint
ALTER TABLE "community"."submission_files" DROP CONSTRAINT "petition_files_file_id_file_metas_id_fk";
--> statement-breakpoint
ALTER TABLE "community"."submission_supports" DROP CONSTRAINT "petition_signatures_petition_id_petitions_id_fk";
--> statement-breakpoint
ALTER TABLE "community"."submission_supports" DROP CONSTRAINT "petition_signatures_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "community"."submissions" DROP CONSTRAINT "petitions_petitioner_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "community"."submissions" DROP CONSTRAINT "petitions_responder_id_users_id_fk";
--> statement-breakpoint
DROP INDEX "community"."petitions_created_idx";--> statement-breakpoint
ALTER TABLE "community"."submission_files" DROP CONSTRAINT "petition_files_petition_id_file_id_pk";--> statement-breakpoint
ALTER TABLE "community"."submission_supports" DROP CONSTRAINT "petition_signatures_petition_id_user_id_pk";--> statement-breakpoint
ALTER TABLE "community"."submission_files" ADD CONSTRAINT "submission_files_submission_id_file_id_pk" PRIMARY KEY("submission_id","file_id");--> statement-breakpoint
ALTER TABLE "community"."submission_supports" ADD CONSTRAINT "submission_supports_submission_id_user_id_pk" PRIMARY KEY("submission_id","user_id");--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD COLUMN "kind" text DEFAULT 'petition' NOT NULL;--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD COLUMN "display_type" text DEFAULT 'realName' NOT NULL;--> statement-breakpoint
ALTER TABLE "community"."submission_files" ADD CONSTRAINT "submission_files_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "community"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community"."submission_files" ADD CONSTRAINT "submission_files_file_id_file_metas_id_fk" FOREIGN KEY ("file_id") REFERENCES "app"."file_metas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community"."submission_supports" ADD CONSTRAINT "submission_supports_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "community"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community"."submission_supports" ADD CONSTRAINT "submission_supports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD CONSTRAINT "submissions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD CONSTRAINT "submissions_responder_id_users_id_fk" FOREIGN KEY ("responder_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "submissions_kind_created_idx" ON "community"."submissions" USING btree ("kind","created_at");--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD CONSTRAINT "submissions_kind_check" CHECK ("community"."submissions"."kind" in ('petition', 'inquiry', 'suggestion'));--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD CONSTRAINT "submissions_category_check" CHECK (("community"."submissions"."kind" = 'petition' and "community"."submissions"."category" is null) or ("community"."submissions"."kind" in ('inquiry', 'suggestion') and "community"."submissions"."category" is not null and "community"."submissions"."category" in ('executive', 'education', 'clubs', 'audit', 'election', 'website', 'other')));--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD CONSTRAINT "submissions_display_type_check" CHECK ("community"."submissions"."display_type" in ('realName', 'nickname', 'anonymous') and ("community"."submissions"."kind" <> 'petition' or "community"."submissions"."display_type" = 'realName'));--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD CONSTRAINT "submissions_status_check" CHECK ("community"."submissions"."status" in ('ongoing', 'pending', 'reviewing', 'answered', 'expired'));--> statement-breakpoint
ALTER TABLE "community"."submissions" ADD CONSTRAINT "submissions_view_count_check" CHECK ("community"."submissions"."view_count" >= 0);
