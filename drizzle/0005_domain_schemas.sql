CREATE SCHEMA "academic";
CREATE SCHEMA "community";

ALTER TABLE "app"."courses" SET SCHEMA "academic";
ALTER TABLE "app"."professors" SET SCHEMA "academic";
ALTER TABLE "app"."course_offerings" SET SCHEMA "academic";
ALTER TABLE "app"."course_offering_professors" SET SCHEMA "academic";
ALTER TABLE "app"."course_meetings" SET SCHEMA "academic";
ALTER TABLE "app"."student_academic_profiles" SET SCHEMA "academic";
ALTER TABLE "app"."graduation_policies" SET SCHEMA "academic";
ALTER TABLE "app"."course_completions" SET SCHEMA "academic";
ALTER TABLE "app"."timetables" SET SCHEMA "academic";
ALTER TABLE "app"."timetable_items" SET SCHEMA "academic";
ALTER TABLE "app"."reviews" SET SCHEMA "academic";

ALTER TABLE "app"."posts" SET SCHEMA "community";
ALTER TABLE "app"."post_likes" SET SCHEMA "community";
ALTER TABLE "app"."comments" SET SCHEMA "community";
ALTER TABLE "app"."petitions" SET SCHEMA "community";
ALTER TABLE "app"."petition_signatures" SET SCHEMA "community";
ALTER TABLE "app"."post_files" SET SCHEMA "community";
ALTER TABLE "app"."petition_files" SET SCHEMA "community";

CREATE TABLE "private"."user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"real_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_users_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade
);

INSERT INTO "private"."user_profiles" ("user_id", "email", "real_name", "created_at", "updated_at")
SELECT "id", "email", "real_name", "created_at", "updated_at"
FROM "app"."users";

CREATE INDEX "user_profiles_email_idx" ON "private"."user_profiles" USING btree ("email");
ALTER TABLE "private"."user_profiles" ENABLE ROW LEVEL SECURITY;

DROP INDEX "app"."users_email_idx";
ALTER TABLE "app"."users" DROP COLUMN "email";
ALTER TABLE "app"."users" DROP COLUMN "real_name";
