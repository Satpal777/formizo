CREATE TYPE "public"."form_access_mode" AS ENUM('public', 'authenticated');--> statement-breakpoint
CREATE TYPE "public"."form_field_type" AS ENUM('short_text', 'long_text', 'email', 'phone', 'number', 'url', 'date', 'time', 'multiple_choice', 'checkboxes', 'dropdown', 'rating', 'opinion_scale', 'yes_no', 'file_upload', 'statement');--> statement-breakpoint
CREATE TYPE "public"."form_logic_action" AS ENUM('show', 'hide', 'jump_to', 'end_form');--> statement-breakpoint
CREATE TYPE "public"."form_logic_operator" AS ENUM('equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty');--> statement-breakpoint
CREATE TYPE "public"."form_result_visibility" AS ENUM('hidden', 'after_submit', 'creator_only');--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "form_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_field_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"field_id" uuid NOT NULL,
	"label" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"order" integer DEFAULT 1000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"type" "form_field_type" NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"placeholder" varchar(255),
	"order" integer DEFAULT 1000 NOT NULL,
	"validation" jsonb,
	"properties" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_logic_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"source_field_id" uuid NOT NULL,
	"target_field_id" uuid,
	"operator" "form_logic_operator" NOT NULL,
	"value" jsonb,
	"action" "form_logic_action" NOT NULL,
	"order" integer DEFAULT 1000 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"respondent_user_id" uuid,
	"respondent_email" varchar(255),
	"is_anonymous" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"slug" varchar(255) NOT NULL,
	"status" "form_status" DEFAULT 'draft' NOT NULL,
	"access_mode" "form_access_mode" DEFAULT 'public' NOT NULL,
	"allow_anonymous_responses" boolean DEFAULT true NOT NULL,
	"allow_multiple_responses" boolean DEFAULT true NOT NULL,
	"password_salt" text,
	"password_hash" text,
	"result_visibility" "form_result_visibility" DEFAULT 'creator_only' NOT NULL,
	"show_individual_submission" boolean DEFAULT false NOT NULL,
	"show_aggregate_summary" boolean DEFAULT false NOT NULL,
	"show_charts" boolean DEFAULT false NOT NULL,
	"collect_email" boolean DEFAULT false NOT NULL,
	"show_progress_bar" boolean DEFAULT true NOT NULL,
	"shuffle_fields" boolean DEFAULT false NOT NULL,
	"redirect_url" text,
	"thank_you_message" text,
	"settings" jsonb,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_response_id_form_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."form_responses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "form_answers_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_field_options" ADD CONSTRAINT "form_field_options_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_logic_rules" ADD CONSTRAINT "form_logic_rules_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_logic_rules" ADD CONSTRAINT "form_logic_rules_source_field_id_form_fields_id_fk" FOREIGN KEY ("source_field_id") REFERENCES "public"."form_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_logic_rules" ADD CONSTRAINT "form_logic_rules_target_field_id_form_fields_id_fk" FOREIGN KEY ("target_field_id") REFERENCES "public"."form_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_responses" ADD CONSTRAINT "form_responses_respondent_user_id_users_id_fk" FOREIGN KEY ("respondent_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;