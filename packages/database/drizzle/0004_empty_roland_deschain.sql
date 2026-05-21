ALTER TABLE "form_fields" DROP CONSTRAINT "unique_field_per_form";--> statement-breakpoint
ALTER TABLE "form_answers" ADD CONSTRAINT "unique_response_field" UNIQUE("response_id","field_id");--> statement-breakpoint
ALTER TABLE "form_field_options" ADD CONSTRAINT "unique_field_option" UNIQUE("field_id","value");--> statement-breakpoint
ALTER TABLE "form_logic_rules" ADD CONSTRAINT "unique_source_operator" UNIQUE("source_field_id","operator");