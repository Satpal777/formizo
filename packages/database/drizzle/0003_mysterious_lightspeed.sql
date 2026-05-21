ALTER TABLE "forms" DROP CONSTRAINT "forms_slug_unique";--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "unique_field_per_form" UNIQUE("form_id","id");--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "unique_create_and_slug" UNIQUE("creator_id","slug");