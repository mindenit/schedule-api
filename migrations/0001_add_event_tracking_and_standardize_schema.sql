ALTER TABLE "auditorium" ALTER COLUMN "floor" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "auditorium" ALTER COLUMN "has_power" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "last_seen_at" bigint NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "event_natural_key" ON "event" USING btree ("started_at","ended_at","subject_id","type","auditorium_id","number_pair");