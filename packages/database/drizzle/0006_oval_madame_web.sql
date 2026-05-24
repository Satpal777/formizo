CREATE TYPE "public"."user_plan" AS ENUM('developer', 'pro');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan" "user_plan" DEFAULT 'developer' NOT NULL;