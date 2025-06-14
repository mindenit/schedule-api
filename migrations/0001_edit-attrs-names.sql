ALTER TABLE "academic_group" RENAME COLUMN "full_name" TO "name";--> statement-breakpoint
ALTER TABLE "auditorium_type" RENAME COLUMN "full_name" TO "name";--> statement-breakpoint
ALTER TABLE "auditorium" RENAME COLUMN "full_name" TO "name";--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "start_time" TO "started_at";--> statement-breakpoint
ALTER TABLE "event" RENAME COLUMN "end_time" TO "ended_at";--> statement-breakpoint
ALTER TABLE "subject" RENAME COLUMN "full_name" TO "name";--> statement-breakpoint
ALTER TABLE "event" DROP CONSTRAINT "start_before_end";--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "start_before_end" CHECK ("event"."started_at" < "event"."ended_at");