ALTER TABLE "app"."push_subscriptions" ADD COLUMN "dining_breakfast" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."push_subscriptions" ADD COLUMN "dining_lunch" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."push_subscriptions" ADD COLUMN "dining_dinner" boolean DEFAULT true NOT NULL;