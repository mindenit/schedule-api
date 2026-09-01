CREATE TYPE "public"."sync_run_status" AS ENUM('running', 'success', 'partial', 'failed');--> statement-breakpoint
CREATE TYPE "public"."sync_run_trigger" AS ENUM('cron', 'bootstrap');--> statement-breakpoint
CREATE TYPE "public"."sync_run_group_status" AS ENUM('success', 'failed');--> statement-breakpoint
CREATE TABLE "sync_run" (
	"id" bigint PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"status" "sync_run_status" DEFAULT 'running' NOT NULL,
	"trigger" "sync_run_trigger" NOT NULL,
	"total_groups" integer DEFAULT 0 NOT NULL,
	"failed_groups" integer DEFAULT 0 NOT NULL,
	"removed_events" integer DEFAULT 0 NOT NULL,
	"steps_json" text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_run_group" (
	"run_id" bigint NOT NULL,
	"group_id" integer NOT NULL,
	"status" "sync_run_group_status" NOT NULL,
	"events_count" integer DEFAULT 0 NOT NULL,
	"error" text,
	"finished_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sync_run_group" ADD CONSTRAINT "sync_run_group_run_id_sync_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."sync_run"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "sync_run_group" ADD CONSTRAINT "sync_run_group_group_id_academic_group_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."academic_group"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "sync_run_group_run_id_idx" ON "sync_run_group" USING btree ("run_id");