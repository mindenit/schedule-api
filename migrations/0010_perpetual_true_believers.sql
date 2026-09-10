CREATE INDEX "event_to_academic_group_group_id_idx" ON "event_to_academic_group" USING btree ("groud_id");--> statement-breakpoint
CREATE INDEX "event_to_teacher_teacher_id_idx" ON "event_to_teacher" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "event_auditorium_id_idx" ON "event" USING btree ("auditorium_id");