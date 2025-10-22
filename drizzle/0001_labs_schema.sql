CREATE TABLE "labs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"user_id" text NOT NULL,
	"topology_image_url" text,
	"status" text NOT NULL DEFAULT 'draft',
	"tags" text[],
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_files" (
	"id" text PRIMARY KEY NOT NULL,
	"lab_id" text NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "labs" ADD CONSTRAINT "labs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "lab_files" ADD CONSTRAINT "lab_files_lab_id_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "public"."labs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "labs_user_id_idx" ON "labs" ("user_id");
--> statement-breakpoint
CREATE INDEX "labs_category_idx" ON "labs" ("category");
--> statement-breakpoint
CREATE INDEX "labs_difficulty_idx" ON "labs" ("difficulty");
--> statement-breakpoint
CREATE INDEX "labs_status_idx" ON "labs" ("status");
--> statement-breakpoint
CREATE INDEX "lab_files_lab_id_idx" ON "lab_files" ("lab_id");