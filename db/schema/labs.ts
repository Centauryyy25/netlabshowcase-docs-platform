import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const labs = pgTable("labs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Routing, Switching, Security, MPLS, etc.
  difficulty: text("difficulty").notNull(), // Beginner, Intermediate, Advanced
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  topologyImageUrl: text("topology_image_url"),
  status: text("status").notNull().default("draft"), // draft, published
  tags: text("tags").array(), // Array of tags for better searchability
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  userIdIdx: index("labs_user_id_idx").on(table.userId),
  categoryIdx: index("labs_category_idx").on(table.category),
  difficultyIdx: index("labs_difficulty_idx").on(table.difficulty),
  statusIdx: index("labs_status_idx").on(table.status),
}));

export const labFiles = pgTable("lab_files", {
  id: text("id").primaryKey(),
  labId: text("lab_id")
    .notNull()
    .references(() => labs.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // pkt, zip, png, jpg, txt, cfg, etc.
  fileSize: integer("file_size").notNull(), // in bytes
  description: text("description"), // Optional description of the file
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
}, (table) => ({
  labIdIdx: index("lab_files_lab_id_idx").on(table.labId),
}));

export type Lab = typeof labs.$inferSelect;
export type NewLab = typeof labs.$inferInsert;
export type LabFile = typeof labFiles.$inferSelect;
export type NewLabFile = typeof labFiles.$inferInsert;