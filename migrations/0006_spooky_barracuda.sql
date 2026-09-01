ALTER TABLE "sync_run" RENAME COLUMN "steps_json" TO "steps";--> statement-breakpoint
ALTER TABLE "sync_run" ALTER COLUMN "steps" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "sync_run" ALTER COLUMN "steps" SET DATA TYPE jsonb USING "steps"::jsonb;--> statement-breakpoint
ALTER TABLE "sync_run" ALTER COLUMN "steps" SET DEFAULT '{}';--> statement-breakpoint
DROP INDEX "sync_run_group_run_id_idx";--> statement-breakpoint
ALTER TABLE "sync_run_group" ADD CONSTRAINT "sync_run_group_run_id_group_id_pk" PRIMARY KEY("run_id","group_id");