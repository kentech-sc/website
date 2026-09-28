ALTER TABLE "app"."banners" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
-- 기존 배너는 올린 순서대로 0 부터 번호를 매긴다. 모두 0 이면 슬라이드 순서가 정해지지 않는다.
UPDATE "app"."banners" AS b
SET "position" = ranked.rn - 1
FROM (
	SELECT "id", row_number() OVER (ORDER BY "created_at") AS rn
	FROM "app"."banners"
) AS ranked
WHERE b."id" = ranked."id";