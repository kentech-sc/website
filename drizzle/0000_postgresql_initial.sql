CREATE SCHEMA "app";
--> statement-breakpoint
CREATE SCHEMA "private";
--> statement-breakpoint
CREATE TABLE "app"."activity_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"cause" text NOT NULL,
	"before_snapshot" jsonb,
	"after_snapshot" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"display_type" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comments_display_type_check" CHECK ("app"."comments"."display_type" in ('email', 'realName', 'nickname', 'anonymous'))
);
--> statement-breakpoint
CREATE TABLE "app"."courses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."file_metas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"size" bigint NOT NULL,
	"mime" text NOT NULL,
	"ext" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "file_metas_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "app"."petition_files" (
	"petition_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	CONSTRAINT "petition_files_petition_id_file_id_pk" PRIMARY KEY("petition_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "app"."petition_signatures" (
	"petition_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "petition_signatures_petition_id_user_id_pk" PRIMARY KEY("petition_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "app"."petitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'ongoing' NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"petitioner_id" uuid NOT NULL,
	"responder_id" uuid,
	"response" text,
	"answered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "petitions_status_check" CHECK ("app"."petitions"."status" in ('ongoing', 'pending', 'reviewing', 'answered', 'expired')),
	CONSTRAINT "petitions_view_count_check" CHECK ("app"."petitions"."view_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "app"."point_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date_key" date NOT NULL,
	"post_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"petition_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "point_states_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "point_states_counts_check" CHECK ("app"."point_states"."post_count" >= 0 and "app"."point_states"."comment_count" >= 0
				and "app"."point_states"."review_count" >= 0 and "app"."point_states"."petition_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "app"."post_files" (
	"post_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	CONSTRAINT "post_files_post_id_file_id_pk" PRIMARY KEY("post_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "app"."post_likes" (
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_likes_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "app"."posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"display_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "posts_board_check" CHECK ("app"."posts"."board_id" in ('notice', 'free', 'bylaw')),
	CONSTRAINT "posts_display_type_check" CHECK ("app"."posts"."display_type" in ('email', 'realName', 'nickname', 'anonymous')),
	CONSTRAINT "posts_view_count_check" CHECK ("app"."posts"."view_count" >= 0),
	CONSTRAINT "posts_comment_count_check" CHECK ("app"."posts"."comment_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "app"."professors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "professors_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "app"."push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"expiration_time" bigint,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_user_endpoint_unique" UNIQUE("user_id","endpoint")
);
--> statement-breakpoint
CREATE TABLE "app"."reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" text NOT NULL,
	"professor_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"term" integer NOT NULL,
	"title" text NOT NULL,
	"assignment_score" double precision NOT NULL,
	"lecture_score" double precision NOT NULL,
	"exam_score" double precision NOT NULL,
	"satisfaction_score" double precision NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_term_check" CHECK ("app"."reviews"."term" between 1 and 4),
	CONSTRAINT "reviews_scores_check" CHECK ("app"."reviews"."assignment_score" between 0 and 5
				and "app"."reviews"."lecture_score" between 0 and 5
				and "app"."reviews"."exam_score" between 0 and 5
				and "app"."reviews"."satisfaction_score" between 0 and 5)
);
--> statement-breakpoint
CREATE TABLE "app"."throttles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bucket" text NOT NULL,
	"available_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "throttles_user_bucket_unique" UNIQUE("user_id","bucket"),
	CONSTRAINT "throttles_bucket_check" CHECK ("app"."throttles"."bucket" in ('article', 'comment'))
);
--> statement-breakpoint
CREATE TABLE "private"."user_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"issuer" text NOT NULL,
	"subject" text NOT NULL,
	"email_at_login" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_identities_issuer_subject_unique" UNIQUE("issuer","subject")
);
--> statement-breakpoint
CREATE TABLE "app"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"real_name" text NOT NULL,
	"nickname" text NOT NULL,
	"group" text DEFAULT 'user' NOT NULL,
	"blocked_until" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"points" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_nickname_unique" UNIQUE("nickname"),
	CONSTRAINT "users_group_check" CHECK ("app"."users"."group" in ('guest', 'user', 'moderator', 'manager', 'dev'))
);
--> statement-breakpoint
ALTER TABLE "app"."comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "app"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."petition_files" ADD CONSTRAINT "petition_files_petition_id_petitions_id_fk" FOREIGN KEY ("petition_id") REFERENCES "app"."petitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."petition_files" ADD CONSTRAINT "petition_files_file_id_file_metas_id_fk" FOREIGN KEY ("file_id") REFERENCES "app"."file_metas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."petition_signatures" ADD CONSTRAINT "petition_signatures_petition_id_petitions_id_fk" FOREIGN KEY ("petition_id") REFERENCES "app"."petitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."petition_signatures" ADD CONSTRAINT "petition_signatures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."petitions" ADD CONSTRAINT "petitions_petitioner_id_users_id_fk" FOREIGN KEY ("petitioner_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."petitions" ADD CONSTRAINT "petitions_responder_id_users_id_fk" FOREIGN KEY ("responder_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."point_states" ADD CONSTRAINT "point_states_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."post_files" ADD CONSTRAINT "post_files_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "app"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."post_files" ADD CONSTRAINT "post_files_file_id_file_metas_id_fk" FOREIGN KEY ("file_id") REFERENCES "app"."file_metas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "app"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."reviews" ADD CONSTRAINT "reviews_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "app"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."reviews" ADD CONSTRAINT "reviews_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "app"."professors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."throttles" ADD CONSTRAINT "throttles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private"."user_identities" ADD CONSTRAINT "user_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_post_created_idx" ON "app"."comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "petitions_created_idx" ON "app"."petitions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "posts_board_created_idx" ON "app"."posts" USING btree ("board_id","created_at");--> statement-breakpoint
CREATE INDEX "push_subscriptions_endpoint_idx" ON "app"."push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "reviews_created_idx" ON "app"."reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_identities_user_id_idx" ON "private"."user_identities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "app"."users" USING btree ("email");