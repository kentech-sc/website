ALTER TABLE "academic"."courses" ADD COLUMN "credits" numeric(4, 1);--> statement-breakpoint
ALTER TABLE "academic"."courses" ADD COLUMN "credit_type" text DEFAULT 'numeric' NOT NULL;--> statement-breakpoint
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "academic"."course_offerings"
		GROUP BY "course_id"
		HAVING count(DISTINCT ("credits", "credit_type")) > 1
	) THEN
		RAISE EXCEPTION 'The same course code has conflicting credit definitions.';
	END IF;
END
$$;--> statement-breakpoint
UPDATE "academic"."courses" AS "course"
SET
	"credits" = "definition"."credits",
	"credit_type" = "definition"."credit_type"
FROM (
	SELECT DISTINCT ON ("course_id")
		"course_id", "credits", "credit_type"
	FROM "academic"."course_offerings"
	ORDER BY "course_id", "year" DESC, "term" DESC, "section"
) AS "definition"
WHERE "course"."id" = "definition"."course_id";--> statement-breakpoint
-- 개설 이력이 없어 학점을 알 수 없는 과목은 0학점·졸업요건 제외로 표시해둔다.
-- 나중에 그 과목이 실제로 개설되어 엑셀로 들어오면 upsertOfferingImport가 정상 학점으로 덮어쓴다.
UPDATE "academic"."courses"
SET
	"credits" = 0,
	"credit_type" = 'numeric',
	"grad_excluded" = true
WHERE "credits" IS NULL;--> statement-breakpoint
ALTER TABLE "academic"."courses" ALTER COLUMN "credits" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "academic"."course_offerings" DROP CONSTRAINT "course_offerings_credits_check";--> statement-breakpoint
ALTER TABLE "academic"."course_offerings" DROP CONSTRAINT "course_offerings_credit_type_check";--> statement-breakpoint
ALTER TABLE "academic"."course_offerings" DROP COLUMN "credits";--> statement-breakpoint
ALTER TABLE "academic"."course_offerings" DROP COLUMN "credit_type";--> statement-breakpoint
ALTER TABLE "academic"."courses" ADD CONSTRAINT "courses_credits_check" CHECK ("academic"."courses"."credits" >= 0);--> statement-breakpoint
ALTER TABLE "academic"."courses" ADD CONSTRAINT "courses_credit_type_check" CHECK ("academic"."courses"."credit_type" in ('numeric', 'pass'));
