ALTER TABLE "academic"."course_offerings" DROP CONSTRAINT "course_offerings_term_course_section_unique";--> statement-breakpoint
ALTER TABLE "academic"."course_offerings" ADD COLUMN "academic_career" text DEFAULT 'undergraduate' NOT NULL;--> statement-breakpoint
ALTER TABLE "academic"."course_offerings" ADD CONSTRAINT "course_offerings_term_career_course_section_unique" UNIQUE("year","term","academic_career","course_id","section");--> statement-breakpoint
ALTER TABLE "academic"."course_offerings" ADD CONSTRAINT "course_offerings_academic_career_check" CHECK ("academic"."course_offerings"."academic_career" in ('undergraduate', 'graduate'));--> statement-breakpoint
-- A timetable containing a cancelled offering cannot remain confirmed.
UPDATE "academic"."timetables" timetable
SET "is_confirmed" = false, "updated_at" = now()
WHERE timetable."is_confirmed" = true
	AND EXISTS (
		SELECT 1
		FROM "academic"."timetable_items" item
		INNER JOIN "academic"."course_offerings" offering ON offering."id" = item."offering_id"
		WHERE item."timetable_id" = timetable."id"
			AND offering."archived_at" IS NOT NULL
	);
