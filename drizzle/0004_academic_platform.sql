CREATE TABLE "app"."course_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" text NOT NULL,
	"year" integer NOT NULL,
	"term" integer NOT NULL,
	"credits" numeric(4, 1) NOT NULL,
	"grade" text,
	"status" text DEFAULT 'passed' NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_completions_user_course_term_unique" UNIQUE("user_id","course_id","year","term"),
	CONSTRAINT "course_completions_term_check" CHECK ("app"."course_completions"."term" between 1 and 4),
	CONSTRAINT "course_completions_credits_check" CHECK ("app"."course_completions"."credits" >= 0),
	CONSTRAINT "course_completions_status_check" CHECK ("app"."course_completions"."status" in ('passed', 'failed', 'withdrawn')),
	CONSTRAINT "course_completions_source_check" CHECK ("app"."course_completions"."source" in ('manual', 'portal', 'admin'))
);
--> statement-breakpoint
ALTER TABLE "app"."course_completions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."course_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offering_id" uuid NOT NULL,
	"weekday" integer NOT NULL,
	"starts_at" integer NOT NULL,
	"ends_at" integer NOT NULL,
	"room" text,
	CONSTRAINT "course_meetings_weekday_check" CHECK ("app"."course_meetings"."weekday" between 1 and 7),
	CONSTRAINT "course_meetings_time_check" CHECK ("app"."course_meetings"."starts_at" >= 0 and "app"."course_meetings"."ends_at" <= 1440 and "app"."course_meetings"."starts_at" < "app"."course_meetings"."ends_at")
);
--> statement-breakpoint
ALTER TABLE "app"."course_meetings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."course_offering_professors" (
	"offering_id" uuid NOT NULL,
	"professor_id" uuid NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "course_offering_professors_offering_id_professor_id_pk" PRIMARY KEY("offering_id","professor_id"),
	CONSTRAINT "course_offering_professors_position_unique" UNIQUE("offering_id","position"),
	CONSTRAINT "course_offering_professors_position_check" CHECK ("app"."course_offering_professors"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "app"."course_offering_professors" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."course_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" text NOT NULL,
	"year" integer NOT NULL,
	"term" integer NOT NULL,
	"section" text DEFAULT '01' NOT NULL,
	"subtitle" text,
	"credits" numeric(4, 1) NOT NULL,
	"credit_type" text DEFAULT 'numeric' NOT NULL,
	"capacity" integer,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_offerings_term_course_section_unique" UNIQUE("year","term","course_id","section"),
	CONSTRAINT "course_offerings_term_check" CHECK ("app"."course_offerings"."term" between 1 and 4),
	CONSTRAINT "course_offerings_credits_check" CHECK ("app"."course_offerings"."credits" >= 0),
	CONSTRAINT "course_offerings_credit_type_check" CHECK ("app"."course_offerings"."credit_type" in ('numeric', 'pass')),
	CONSTRAINT "course_offerings_capacity_check" CHECK ("app"."course_offerings"."capacity" is null or "app"."course_offerings"."capacity" >= 0)
);
--> statement-breakpoint
ALTER TABLE "app"."course_offerings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."graduation_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"admission_year_from" integer NOT NULL,
	"admission_year_to" integer NOT NULL,
	"rules" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "graduation_policies_year_range_unique" UNIQUE("admission_year_from","admission_year_to"),
	CONSTRAINT "graduation_policies_year_range_check" CHECK ("app"."graduation_policies"."admission_year_from" <= "app"."graduation_policies"."admission_year_to")
);
--> statement-breakpoint
ALTER TABLE "app"."graduation_policies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."student_academic_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"admission_year" integer NOT NULL,
	"esp_start_level" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "student_academic_profiles_admission_year_check" CHECK ("app"."student_academic_profiles"."admission_year" between 2022 and 2100),
	CONSTRAINT "student_academic_profiles_esp_start_level_check" CHECK ("app"."student_academic_profiles"."esp_start_level" between 1 and 3)
);
--> statement-breakpoint
ALTER TABLE "app"."student_academic_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."timetable_items" (
	"timetable_id" uuid NOT NULL,
	"offering_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "timetable_items_timetable_id_offering_id_pk" PRIMARY KEY("timetable_id","offering_id")
);
--> statement-breakpoint
ALTER TABLE "app"."timetable_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."timetables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"term" integer NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL,
	"is_confirmed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "timetables_user_term_position_unique" UNIQUE("user_id","year","term","position"),
	CONSTRAINT "timetables_user_term_name_unique" UNIQUE("user_id","year","term","name"),
	CONSTRAINT "timetables_term_check" CHECK ("app"."timetables"."term" between 1 and 4),
	CONSTRAINT "timetables_position_check" CHECK ("app"."timetables"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "app"."timetables" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."reviews" ALTER COLUMN "course_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."reviews" ALTER COLUMN "professor_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."reviews" ALTER COLUMN "year" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."reviews" ALTER COLUMN "term" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."courses" ADD COLUMN "category" text;--> statement-breakpoint
ALTER TABLE "app"."courses" ADD COLUMN "subcategory" text;--> statement-breakpoint
ALTER TABLE "app"."courses" ADD COLUMN "level" integer;--> statement-breakpoint
ALTER TABLE "app"."courses" ADD COLUMN "grad_excluded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."courses" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."courses" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."reviews" ADD COLUMN "offering_id" uuid;--> statement-breakpoint
ALTER TABLE "app"."course_completions" ADD CONSTRAINT "course_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."course_completions" ADD CONSTRAINT "course_completions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "app"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."course_meetings" ADD CONSTRAINT "course_meetings_offering_id_course_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "app"."course_offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."course_offering_professors" ADD CONSTRAINT "course_offering_professors_offering_id_course_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "app"."course_offerings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."course_offering_professors" ADD CONSTRAINT "course_offering_professors_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "app"."professors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."course_offerings" ADD CONSTRAINT "course_offerings_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "app"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."student_academic_profiles" ADD CONSTRAINT "student_academic_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."timetable_items" ADD CONSTRAINT "timetable_items_timetable_id_timetables_id_fk" FOREIGN KEY ("timetable_id") REFERENCES "app"."timetables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."timetable_items" ADD CONSTRAINT "timetable_items_offering_id_course_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "app"."course_offerings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."timetables" ADD CONSTRAINT "timetables_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_completions_user_idx" ON "app"."course_completions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "course_meetings_offering_idx" ON "app"."course_meetings" USING btree ("offering_id");--> statement-breakpoint
CREATE INDEX "course_offering_professors_professor_idx" ON "app"."course_offering_professors" USING btree ("professor_id");--> statement-breakpoint
CREATE INDEX "course_offerings_term_idx" ON "app"."course_offerings" USING btree ("year","term");--> statement-breakpoint
CREATE UNIQUE INDEX "timetables_one_confirmed_per_term_unique" ON "app"."timetables" USING btree ("user_id","year","term") WHERE "app"."timetables"."is_confirmed" = true;--> statement-breakpoint
CREATE INDEX "timetable_items_offering_idx" ON "app"."timetable_items" USING btree ("offering_id","timetable_id");--> statement-breakpoint
CREATE INDEX "timetables_confirmed_term_idx" ON "app"."timetables" USING btree ("year","term") WHERE "app"."timetables"."is_confirmed" = true;--> statement-breakpoint
ALTER TABLE "app"."reviews" ADD CONSTRAINT "reviews_offering_id_course_offerings_id_fk" FOREIGN KEY ("offering_id") REFERENCES "app"."course_offerings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_user_offering_unique" ON "app"."reviews" USING btree ("user_id","offering_id") WHERE "app"."reviews"."offering_id" is not null;--> statement-breakpoint
ALTER TABLE "app"."reviews" ADD CONSTRAINT "reviews_reference_check" CHECK ("app"."reviews"."offering_id" is not null or ("app"."reviews"."course_id" is not null and "app"."reviews"."year" is not null and "app"."reviews"."term" is not null));
--> statement-breakpoint
ALTER TABLE "app"."courses" DROP COLUMN "content";
--> statement-breakpoint
UPDATE "app"."courses"
SET "category" = CASE
	WHEN "id" LIKE 'VC%' THEN 'VC'
	WHEN "id" LIKE 'EF%' THEN 'EF'
	WHEN "id" LIKE 'EL%' OR "id" LIKE 'GS%' THEN 'EL'
	WHEN "id" LIKE 'MN%' THEN 'MN'
	WHEN "id" LIKE 'HA%' THEN 'HASS'
	WHEN "id" LIKE 'ES%' THEN 'ESP'
	WHEN "id" LIKE 'IR%' THEN 'IR'
	WHEN "id" LIKE 'CA%' THEN 'CAPS'
	WHEN "id" LIKE 'EN%' THEN 'EN'
	WHEN "id" LIKE 'RC%' THEN 'RC'
	WHEN "id" LIKE 'FR%' OR "id" LIKE 'EE%' THEN 'FR'
	ELSE "category"
END,
"subcategory" = CASE
	WHEN "id" IN ('EF1001','EF1008','EF1009','EF1011','EF1012','EF1013','EF1014','EF1015','EF1016','EF1017','EF2007','EF2008','EF2031','EF2032','EF2033') THEN 'math'
	WHEN "id" IN ('EF1004','EF1005','EF1051','EF2004','EF2036') THEN 'physics'
	WHEN "id" IN ('EF1002','EF1006','EF1007','EF2002','EF2005','EF2034') THEN 'chemistry'
	WHEN "id" IN ('EF1003','EF2003','EF2006','EF2035','EF2039') THEN 'data_literacy'
	ELSE "subcategory"
END,
"level" = CASE
	WHEN "id" ~ '^EL[1-5]' THEN substring("id" from '^EL([1-5])')::integer
	WHEN "id" ~ '^ES[1-3]' THEN substring("id" from '^ES([1-3])')::integer
	ELSE "level"
END,
"grad_excluded" = "grad_excluded" OR "id" LIKE 'GR%' OR "id" IN ('RC1011','RC1012','RC1013');
--> statement-breakpoint
INSERT INTO "app"."graduation_policies" (
	"name", "admission_year_from", "admission_year_to", "rules"
) VALUES
(
	'2022–2024학번', 2022, 2024,
	'{"totalCredits":128,"categoryRequirements":{"VC":8,"EF":28,"EL":40,"MN":16,"HASS":4,"ESP":4,"IR":4,"CAPS":4,"EN":4,"RC":4,"FR":12},"subcategoryRequirements":[{"category":"EF","subcategory":"math","minimumCredits":4},{"category":"EF","subcategory":"physics","minimumCredits":4},{"category":"EF","subcategory":"chemistry","minimumCredits":4},{"category":"EF","subcategory":"data_literacy","minimumCredits":4}],"levelRequirements":[{"category":"EL","minimumLevel":4,"minimumCredits":8}],"courseCountAwards":[{"category":"ESP","minimumLevel":3,"minimumCourses":2,"awardedCredits":4,"requiresCompletedSequence":true}],"subcategoryCaps":[{"category":"EF","subcategory":"ap","maximumCredits":4}],"courseSequences":[{"category":"ESP","stages":[["ES1001"],["ES1002"],["ES2001","ES2002"],["ES3001","ES3002"]],"waivedStagesByStartLevel":{"1":0,"2":1,"3":2}}]}'::jsonb
),
(
	'2025학번 이후', 2025, 2100,
	'{"totalCredits":128,"categoryRequirements":{"VC":8,"EF":28,"EL":40,"MN":16,"HASS":4,"ESP":4,"IR":4,"CAPS":4,"EN":4,"RC":4,"FR":12},"subcategoryRequirements":[{"category":"EF","subcategory":"math","minimumCredits":8},{"category":"EF","subcategory":"physics","minimumCredits":4},{"category":"EF","subcategory":"chemistry","minimumCredits":4},{"category":"EF","subcategory":"data_literacy","minimumCredits":4}],"levelRequirements":[{"category":"EL","minimumLevel":4,"minimumCredits":8}],"courseCountAwards":[{"category":"ESP","minimumLevel":3,"minimumCourses":2,"awardedCredits":4,"requiresCompletedSequence":true}],"subcategoryCaps":[{"category":"EF","subcategory":"ap","maximumCredits":4}],"courseSequences":[{"category":"ESP","stages":[["ES1001"],["ES1002"],["ES2001","ES2002"],["ES3001","ES3002"]],"waivedStagesByStartLevel":{"1":0,"2":1,"3":2}}]}'::jsonb
);
