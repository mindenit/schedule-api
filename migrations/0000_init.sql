CREATE TYPE "public"."event_type" AS ENUM('Лк', 'Пз', 'Лб', 'Конс', 'Зал', 'Екз', 'КП/КР');--> statement-breakpoint
CREATE TABLE "academic_group" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"direction_id" integer,
	"speciality_id" integer
);
--> statement-breakpoint
CREATE TABLE "auditorium_type_to_auditorium" (
	"auditorium_id" integer NOT NULL,
	"auditorium_type_id" integer NOT NULL,
	CONSTRAINT "auditorium_type_to_auditorium_auditorium_id_auditorium_type_id_pk" PRIMARY KEY("auditorium_id","auditorium_type_id")
);
--> statement-breakpoint
CREATE TABLE "auditorium_type" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auditorium" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"floor" smallint NOT NULL,
	"has_power" boolean NOT NULL,
	"building_id" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building" (
	"id" varchar PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"short_name" varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"short_name" varchar(40) NOT NULL,
	"faculty_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "direction" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"short_name" varchar(40) NOT NULL,
	"faculty_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_to_academic_group" (
	"event_id" integer NOT NULL,
	"groud_id" integer NOT NULL,
	CONSTRAINT "event_to_academic_group_event_id_groud_id_pk" PRIMARY KEY("event_id","groud_id")
);
--> statement-breakpoint
CREATE TABLE "event_to_teacher" (
	"event_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	CONSTRAINT "event_to_teacher_event_id_teacher_id_pk" PRIMARY KEY("event_id","teacher_id")
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"started_at" timestamp,
	"ended_at" timestamp,
	"number_pair" smallint,
	"type" "event_type",
	"auditorium_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	CONSTRAINT "start_before_end" CHECK ("event"."started_at" < "event"."ended_at")
);
--> statement-breakpoint
CREATE TABLE "faculty" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"short_name" varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speciality" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"short_name" varchar(40) NOT NULL,
	"direction_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject_to_teacher" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subject_to_teacher_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"hours" smallint,
	"type" "event_type",
	"subject_id" integer NOT NULL,
	"teacher_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subject" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"brief" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teacher" (
	"id" integer PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"short_name" varchar(40) NOT NULL,
	"department_id" integer NOT NULL
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
ALTER TABLE "event" ADD CONSTRAINT "event_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "speciality" ADD CONSTRAINT "speciality_direction_id_direction_id_fk" FOREIGN KEY ("direction_id") REFERENCES "public"."direction"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subject_to_teacher" ADD CONSTRAINT "subject_to_teacher_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subject_to_teacher" ADD CONSTRAINT "subject_to_teacher_teacher_id_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE cascade;