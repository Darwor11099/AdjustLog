import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adjustments = sqliteTable("adjustments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pieceId: text("piece_id").notNull(),
  pieceName: text("piece_name").notNull(),
  location: text("location").notNull(),
  quantity: integer("quantity").notNull(),
  memo: text("memo").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
