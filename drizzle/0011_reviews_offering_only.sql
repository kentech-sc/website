ALTER TABLE "academic"."reviews" DROP CONSTRAINT "reviews_term_check";--> statement-breakpoint
ALTER TABLE "academic"."reviews" DROP CONSTRAINT "reviews_reference_check";--> statement-breakpoint
ALTER TABLE "academic"."reviews" DROP CONSTRAINT "reviews_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "academic"."reviews" DROP CONSTRAINT "reviews_professor_id_professors_id_fk";
--> statement-breakpoint
DROP INDEX "academic"."reviews_user_offering_unique";--> statement-breakpoint
ALTER TABLE "academic"."reviews" ALTER COLUMN "offering_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_user_offering_unique" ON "academic"."reviews" USING btree ("user_id","offering_id");--> statement-breakpoint
ALTER TABLE "academic"."reviews" DROP COLUMN "course_id";--> statement-breakpoint
ALTER TABLE "academic"."reviews" DROP COLUMN "professor_id";--> statement-breakpoint
ALTER TABLE "academic"."reviews" DROP COLUMN "year";--> statement-breakpoint
ALTER TABLE "academic"."reviews" DROP COLUMN "term";