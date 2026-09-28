ALTER TABLE "app"."users" ADD COLUMN "gender" text;
--> statement-breakpoint
ALTER TABLE "app"."users" ADD COLUMN "house" text;
--> statement-breakpoint
ALTER TABLE "app"."users" ADD CONSTRAINT "users_gender_check" CHECK ("gender" in ('male', 'female'));
--> statement-breakpoint
ALTER TABLE "app"."users" ADD CONSTRAINT "users_house_check" CHECK ("house" in ('tesla', 'edison'));
