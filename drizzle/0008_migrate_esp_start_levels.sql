UPDATE "academic"."student_academic_profiles"
SET "esp_waived_course_ids" = CASE "esp_start_level"
	WHEN 2 THEN '["ES1001"]'::jsonb
	WHEN 3 THEN '["ES1001", "ES1002"]'::jsonb
	ELSE '[]'::jsonb
END;--> statement-breakpoint
ALTER TABLE "academic"."student_academic_profiles" DROP CONSTRAINT "student_academic_profiles_esp_start_level_check";--> statement-breakpoint
ALTER TABLE "academic"."student_academic_profiles" DROP COLUMN "esp_start_level";
