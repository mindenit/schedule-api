ALTER TABLE "event_to_academic_group" ADD COLUMN "last_seen_at" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "event_to_teacher" ADD COLUMN "last_seen_at" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "event_to_academic_group_last_seen_at_idx" ON "event_to_academic_group" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "event_to_teacher_last_seen_at_idx" ON "event_to_teacher" USING btree ("last_seen_at");