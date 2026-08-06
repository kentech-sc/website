-- 학점교류 과목을 일반 강의로 통합한다. 대학명(institution)은 더 이상 보관하지 않는다.
-- 기존 학점교류 이력은 자유선택(FR)으로 집계되고 있었으므로 그 영역을 그대로 유지한다.
INSERT INTO "academic"."courses" ("id", "name", "category", "subcategory", "level", "credits", "credit_type", "grad_excluded")
SELECT
	ec."course_code",
	MIN(ec."name"),
	'FR',
	NULL,
	NULL,
	COALESCE(MAX(cc."credits"), 0),
	'numeric',
	false
FROM "academic"."external_courses" ec
LEFT JOIN "academic"."course_completions" cc ON cc."external_course_id" = ec."id"
GROUP BY ec."course_code"
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint
-- 이관 후 같은 (사용자, 강의, 연도, 학기) 가 되는 학점교류 이력은 기존 이력을 남기고 버린다.
DELETE FROM "academic"."course_completions" cc
USING "academic"."external_courses" ec
WHERE cc."external_course_id" = ec."id"
	AND EXISTS (
		SELECT 1
		FROM "academic"."course_completions" other
		WHERE other."user_id" = cc."user_id"
			AND other."course_id" = ec."course_code"
			AND other."year" = cc."year"
			AND other."term" = cc."term"
	);
--> statement-breakpoint
-- 같은 과목코드로 이관되는 학점교류 이력끼리 겹치면 하나만 남긴다.
DELETE FROM "academic"."course_completions" cc
USING "academic"."external_courses" ec,
	"academic"."course_completions" keep,
	"academic"."external_courses" keep_ec
WHERE cc."external_course_id" = ec."id"
	AND keep."external_course_id" = keep_ec."id"
	AND keep."user_id" = cc."user_id"
	AND keep."year" = cc."year"
	AND keep."term" = cc."term"
	AND keep_ec."course_code" = ec."course_code"
	AND keep."id" < cc."id";
--> statement-breakpoint
-- 남은 학점교류 이력을 일반 수강 이력으로 전환한다.
UPDATE "academic"."course_completions" cc
SET "course_id" = ec."course_code", "external_course_id" = NULL, "updated_at" = now()
FROM "academic"."external_courses" ec
WHERE cc."external_course_id" = ec."id";
--> statement-breakpoint
-- AP 과목만 따로 두던 서브카테고리 예외를 없앤다.
UPDATE "academic"."courses" SET "subcategory" = NULL, "updated_at" = now() WHERE "subcategory" = 'ap';
--> statement-breakpoint
ALTER TABLE "academic"."course_completions" DROP CONSTRAINT "course_completions_user_external_term_unique";--> statement-breakpoint
ALTER TABLE "academic"."course_completions" DROP CONSTRAINT "course_completions_reference_check";--> statement-breakpoint
ALTER TABLE "academic"."course_completions" DROP CONSTRAINT "course_completions_external_course_id_external_courses_id_fk";--> statement-breakpoint
ALTER TABLE "academic"."course_completions" DROP COLUMN "external_course_id";--> statement-breakpoint
ALTER TABLE "academic"."course_completions" ADD CONSTRAINT "course_completions_reference_check" CHECK (num_nonnulls("academic"."course_completions"."course_id", "academic"."course_completions"."offering_id") = 1);--> statement-breakpoint
DROP TABLE "academic"."external_courses" CASCADE;
