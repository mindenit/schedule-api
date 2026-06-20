DROP INDEX "event_natural_key";--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "teachers_key" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "event_natural_key" ON "event" USING btree ("started_at","ended_at","subject_id","type","auditorium_id","number_pair","teachers_key");