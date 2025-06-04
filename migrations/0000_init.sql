CREATE TYPE "public"."event_type" AS ENUM('Лк', 'Пз', 'Лб', 'Конс', 'Зал', 'Екз', 'КП/КР');--> statement-breakpoint
CREATE TABLE "academic_group" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"direction_id" integer,
	"speciality_id" integer
);
--> statement-breakpoint
CREATE TABLE "auditorium_type_to_auditorium" (
	"auditorium_id" integer,
	"auditorium_type_id" integer,
	CONSTRAINT "auditorium_type_to_auditorium_auditorium_id_auditorium_type_id_pk" PRIMARY KEY("auditorium_id","auditorium_type_id")
);
--> statement-breakpoint
CREATE TABLE "auditorium_type" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "auditorium" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"floor" smallint,
	"has_power" boolean,
	"building_id" integer
);
--> statement-breakpoint
CREATE TABLE "building" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"short_name" varchar(40)
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"short_name" varchar(40),
	"faculty_id" integer
);
--> statement-breakpoint
CREATE TABLE "direction" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"short_name" varchar(40),
	"faculty_id" integer
);
--> statement-breakpoint
CREATE TABLE "event_to_academic_group" (
	"event_id" integer,
	"groud_id" integer,
	CONSTRAINT "event_to_academic_group_event_id_groud_id_pk" PRIMARY KEY("event_id","groud_id")
);
--> statement-breakpoint
CREATE TABLE "event_to_teacher" (
	"event_id" integer,
	"teacher_id" integer,
	CONSTRAINT "event_to_teacher_event_id_teacher_id_pk" PRIMARY KEY("event_id","teacher_id")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" integer PRIMARY KEY NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp,
	"number_pair" smallint,
	"type" "event_type",
	"auditorium_id" integer,
	CONSTRAINT "start_before_end" CHECK ("event"."start_time" < "event"."end_time")
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"short_name" varchar(40)
);
--> statement-breakpoint
CREATE TABLE "speciality" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"short_name" varchar(40),
	"direction_id" integer
);
--> statement-breakpoint
CREATE TABLE "subject_to_teacher" (
	"id" integer PRIMARY KEY NOT NULL,
	"hours" smallint,
	"type" "event_type",
	"subject_id" integer,
	"teacher_id" integer
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"short_name" varchar(40)
);
--> statement-breakpoint
CREATE TABLE "teacher" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"short_name" varchar(40),
	"department_id" integer
);
--> statement-breakpoint
ALTER TABLE "academic_group" ADD CONSTRAINT "academic_group_direction_id_direction_id_fk" FOREIGN KEY ("direction_id") REFERENCES "public"."direction"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "academic_group" ADD CONSTRAINT "academic_group_speciality_id_speciality_id_fk" FOREIGN KEY ("speciality_id") REFERENCES "public"."speciality"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auditorium_type_to_auditorium" ADD CONSTRAINT "auditorium_type_to_auditorium_auditorium_id_auditorium_id_fk" FOREIGN KEY ("auditorium_id") REFERENCES "public"."auditorium"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auditorium_type_to_auditorium" ADD CONSTRAINT "auditorium_type_to_auditorium_auditorium_type_id_auditorium_type_id_fk" FOREIGN KEY ("auditorium_type_id") REFERENCES "public"."auditorium_type"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "auditorium" ADD CONSTRAINT "auditorium_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "department" ADD CONSTRAINT "department_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "direction" ADD CONSTRAINT "direction_faculty_id_faculty_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculty"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_to_academic_group" ADD CONSTRAINT "event_to_academic_group_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_to_academic_group" ADD CONSTRAINT "event_to_academic_group_groud_id_academic_group_id_fk" FOREIGN KEY ("groud_id") REFERENCES "public"."academic_group"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_to_teacher" ADD CONSTRAINT "event_to_teacher_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event_to_teacher" ADD CONSTRAINT "event_to_teacher_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_auditorium_id_auditorium_id_fk" FOREIGN KEY ("auditorium_id") REFERENCES "public"."auditorium"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "speciality" ADD CONSTRAINT "speciality_direction_id_direction_id_fk" FOREIGN KEY ("direction_id") REFERENCES "public"."direction"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subject_to_teacher" ADD CONSTRAINT "subject_to_teacher_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subject_to_teacher" ADD CONSTRAINT "subject_to_teacher_teacher_id_subject_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE cascade;