CREATE TABLE "academic"."external_courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"institution" text NOT NULL,
	"course_code" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "external_courses_institution_code_unique" UNIQUE("institution","course_code")
);
--> statement-breakpoint
ALTER TABLE "academic"."external_courses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "academic"."course_completions" ALTER COLUMN "course_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "academic"."course_completions" ADD COLUMN "offering_id" uuid;--> statement-breakpoint
ALTER TABLE "academic"."course_completions" ADD COLUMN "external_course_id" uuid;--> statement-breakpoint
ALTER TABLE "academic"."student_academic_profiles" ADD COLUMN "esp_waived_course_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "academic"."course_completions" ADD CONSTRAINT "course_completions_offering_id_course_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "academic"."course_offerings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."course_completions" ADD CONSTRAINT "course_completions_external_course_id_external_courses_id_fk" FOREIGN KEY ("external_course_id") REFERENCES "academic"."external_courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic"."course_completions" ADD CONSTRAINT "course_completions_user_offering_unique" UNIQUE("user_id","offering_id");--> statement-breakpoint
ALTER TABLE "academic"."course_completions" ADD CONSTRAINT "course_completions_user_external_term_unique" UNIQUE("user_id","external_course_id","year","term");--> statement-breakpoint
ALTER TABLE "academic"."course_completions" ADD CONSTRAINT "course_completions_reference_check" CHECK (num_nonnulls("academic"."course_completions"."course_id", "academic"."course_completions"."offering_id", "academic"."course_completions"."external_course_id") = 1);--> statement-breakpoint
ALTER TABLE "academic"."student_academic_profiles" ADD CONSTRAINT "student_academic_profiles_esp_waived_courses_check" CHECK (jsonb_typeof("academic"."student_academic_profiles"."esp_waived_course_ids") = 'array');