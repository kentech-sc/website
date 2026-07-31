ALTER TABLE "app"."reviews" DROP CONSTRAINT "reviews_scores_check";--> statement-breakpoint
ALTER TABLE "app"."reviews" ADD CONSTRAINT "reviews_scores_check" CHECK ("app"."reviews"."assignment_score" between 1 and 5
				and "app"."reviews"."lecture_score" between 1 and 5
				and "app"."reviews"."exam_score" between 1 and 5
				and "app"."reviews"."satisfaction_score" between 1 and 10);