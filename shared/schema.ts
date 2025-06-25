import { pgTable, text, serial, integer, decimal, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users/Partners table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").default("partner"), // partner, admin
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Livestock table
export const livestock = pgTable("livestock", {
  id: serial("id").primaryKey(),
  tagId: text("tag_id").notNull().unique(), // e.g., C-001
  breed: text("breed").notNull(),
  gender: text("gender").notNull(), // male, female
  birthDate: timestamp("birth_date"),
  weight: decimal("weight", { precision: 8, scale: 2 }), // in lbs
  healthStatus: text("health_status").default("healthy"), // healthy, monitoring, sick
  location: text("location"), // pasture name
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  purchaseDate: timestamp("purchase_date"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Financial transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // income, expense
  category: text("category").notNull(), // livestock_sales, feed_supplies, equipment, maintenance, etc.
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  partnerId: integer("partner_id").references(() => users.id),
  livestockId: integer("livestock_id").references(() => livestock.id), // if related to specific animal
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory table
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // feed, medicine, equipment, supplies
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull(), // tons, lbs, gallons, pieces
  minStockLevel: decimal("min_stock_level", { precision: 10, scale: 2 }),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }),
  supplier: text("supplier"),
  lastRestocked: timestamp("last_restocked"),
  expiryDate: timestamp("expiry_date"),
  location: text("location"), // storage location
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health records table
export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  livestockId: integer("livestock_id").references(() => livestock.id).notNull(),
  recordType: text("record_type").notNull(), // vaccination, treatment, checkup
  description: text("description").notNull(),
  veterinarian: text("veterinarian"),
  cost: decimal("cost", { precision: 8, scale: 2 }),
  date: timestamp("date").notNull(),
  nextDueDate: timestamp("next_due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertLivestockSchema = createInsertSchema(livestock).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHealthRecordSchema = createInsertSchema(healthRecords).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Livestock = typeof livestock.$inferSelect;
export type InsertLivestock = z.infer<typeof insertLivestockSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;

export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = z.infer<typeof insertHealthRecordSchema>;
