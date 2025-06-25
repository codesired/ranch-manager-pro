import { 
  users, livestock, transactions, inventory, healthRecords,
  type User, type InsertUser, type UpsertUser,
  type Livestock, type InsertLivestock,
  type Transaction, type InsertTransaction,
  type Inventory, type InsertInventory,
  type HealthRecord, type InsertHealthRecord
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserLastActive(id: string): Promise<void>;

  // Livestock operations
  getAllLivestock(): Promise<Livestock[]>;
  getLivestock(id: number): Promise<Livestock | undefined>;
  getLivestockByTagId(tagId: string): Promise<Livestock | undefined>;
  createLivestock(livestock: InsertLivestock): Promise<Livestock>;
  updateLivestock(id: number, livestock: Partial<InsertLivestock>): Promise<Livestock>;
  deleteLivestock(id: number): Promise<void>;
  getLivestockStats(): Promise<{
    total: number;
    healthy: number;
    monitoring: number;
    sick: number;
  }>;

  // Transaction operations
  getAllTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  getFinancialSummary(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    monthlyRevenue: number;
  }>;

  // Inventory operations
  getAllInventory(): Promise<Inventory[]>;
  getInventory(id: number): Promise<Inventory | undefined>;
  createInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventory(id: number, inventory: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventory(id: number): Promise<void>;
  getLowStockItems(): Promise<Inventory[]>;

  // Health record operations
  getAllHealthRecords(): Promise<HealthRecord[]>;
  getHealthRecordsByLivestock(livestockId: number): Promise<HealthRecord[]>;
  createHealthRecord(record: InsertHealthRecord): Promise<HealthRecord>;
  getUpcomingHealthTasks(): Promise<HealthRecord[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserLastActive(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, id));
  }

  // Livestock operations
  async getAllLivestock(): Promise<Livestock[]> {
    return await db.select().from(livestock).where(eq(livestock.isActive, true));
  }

  async getLivestock(id: number): Promise<Livestock | undefined> {
    const [result] = await db.select().from(livestock).where(eq(livestock.id, id));
    return result;
  }

  async getLivestockByTagId(tagId: string): Promise<Livestock | undefined> {
    const [result] = await db.select().from(livestock).where(eq(livestock.tagId, tagId));
    return result;
  }

  async createLivestock(insertLivestock: InsertLivestock): Promise<Livestock> {
    const [result] = await db
      .insert(livestock)
      .values(insertLivestock)
      .returning();
    return result;
  }

  async updateLivestock(id: number, updates: Partial<InsertLivestock>): Promise<Livestock> {
    const [result] = await db
      .update(livestock)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(livestock.id, id))
      .returning();
    if (!result) throw new Error("Livestock not found");
    return result;
  }

  async deleteLivestock(id: number): Promise<void> {
    await db
      .update(livestock)
      .set({ isActive: false })
      .where(eq(livestock.id, id));
  }

  async getLivestockStats(): Promise<{ total: number; healthy: number; monitoring: number; sick: number; }> {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        healthy: sql<number>`count(*) filter (where health_status = 'healthy')`,
        monitoring: sql<number>`count(*) filter (where health_status = 'monitoring')`,
        sick: sql<number>`count(*) filter (where health_status = 'sick')`,
      })
      .from(livestock)
      .where(eq(livestock.isActive, true));
    
    return result[0] || { total: 0, healthy: 0, monitoring: 0, sick: 0 };
  }

  // Transaction operations
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [result] = await db.select().from(transactions).where(eq(transactions.id, id));
    return result;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [result] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return result;
  }

  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction> {
    const [result] = await db
      .update(transactions)
      .set(updates)
      .where(eq(transactions.id, id))
      .returning();
    if (!result) throw new Error("Transaction not found");
    return result;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))
      .orderBy(desc(transactions.date));
  }

  async getFinancialSummary(): Promise<{ totalIncome: number; totalExpenses: number; netProfit: number; monthlyRevenue: number; }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [incomeResult] = await db
      .select({
        total: sql<number>`sum(cast(amount as decimal))`
      })
      .from(transactions)
      .where(eq(transactions.type, "income"));
    
    const [expenseResult] = await db
      .select({
        total: sql<number>`sum(cast(amount as decimal))`
      })
      .from(transactions)
      .where(eq(transactions.type, "expense"));
    
    const [monthlyResult] = await db
      .select({
        total: sql<number>`sum(cast(amount as decimal))`
      })
      .from(transactions)
      .where(and(eq(transactions.type, "income"), gte(transactions.date, monthStart)));

    const totalIncome = Number(incomeResult?.total || 0);
    const totalExpenses = Number(expenseResult?.total || 0);
    const monthlyRevenue = Number(monthlyResult?.total || 0);

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      monthlyRevenue
    };
  }

  // Inventory operations
  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async getInventory(id: number): Promise<Inventory | undefined> {
    const [result] = await db.select().from(inventory).where(eq(inventory.id, id));
    return result;
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const [result] = await db
      .insert(inventory)
      .values(insertInventory)
      .returning();
    return result;
  }

  async updateInventory(id: number, updates: Partial<InsertInventory>): Promise<Inventory> {
    const [result] = await db
      .update(inventory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventory.id, id))
      .returning();
    if (!result) throw new Error("Inventory item not found");
    return result;
  }

  async deleteInventory(id: number): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  async getLowStockItems(): Promise<Inventory[]> {
    return await db
      .select()
      .from(inventory)
      .where(sql`cast(quantity as decimal) <= cast(min_stock_level as decimal)`);
  }

  // Health record operations
  async getAllHealthRecords(): Promise<HealthRecord[]> {
    return await db.select().from(healthRecords).orderBy(desc(healthRecords.date));
  }

  async getHealthRecordsByLivestock(livestockId: number): Promise<HealthRecord[]> {
    return await db
      .select()
      .from(healthRecords)
      .where(eq(healthRecords.livestockId, livestockId))
      .orderBy(desc(healthRecords.date));
  }

  async createHealthRecord(insertRecord: InsertHealthRecord): Promise<HealthRecord> {
    const [result] = await db
      .insert(healthRecords)
      .values(insertRecord)
      .returning();
    return result;
  }

  async getUpcomingHealthTasks(): Promise<HealthRecord[]> {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(healthRecords)
      .where(and(
        gte(healthRecords.nextDueDate, now),
        lte(healthRecords.nextDueDate, oneWeekFromNow)
      ))
      .orderBy(healthRecords.nextDueDate);
  }
}

export const storage = new DatabaseStorage();