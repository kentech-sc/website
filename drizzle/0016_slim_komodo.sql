CREATE TABLE "app"."banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"file_id" uuid NOT NULL,
	"link_url" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."banners" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."banners" ADD CONSTRAINT "banners_file_id_file_metas_id_fk" FOREIGN KEY ("file_id") REFERENCES "app"."file_metas"("id") ON DELETE no action ON UPDATE no action;