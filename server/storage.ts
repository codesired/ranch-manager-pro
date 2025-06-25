import { 
  users, livestock, transactions, inventory, healthRecords,
  type User, type InsertUser,
  type Livestock, type InsertLivestock,
  type Transaction, type InsertTransaction,
  type Inventory, type InsertInventory,
  type HealthRecord, type InsertHealthRecord
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserLastActive(id: number): Promise<void>;

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private livestock: Map<number, Livestock>;
  private transactions: Map<number, Transaction>;
  private inventory: Map<number, Inventory>;
  private healthRecords: Map<number, HealthRecord>;
  private currentUserId: number;
  private currentLivestockId: number;
  private currentTransactionId: number;
  private currentInventoryId: number;
  private currentHealthRecordId: number;

  constructor() {
    this.users = new Map();
    this.livestock = new Map();
    this.transactions = new Map();
    this.inventory = new Map();
    this.healthRecords = new Map();
    this.currentUserId = 1;
    this.currentLivestockId = 1;
    this.currentTransactionId = 1;
    this.currentInventoryId = 1;
    this.currentHealthRecordId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample users/partners
    const partners = [
      { username: "john_smith", password: "password", firstName: "John", lastName: "Smith", email: "john@ranch-partners.com", role: "admin" },
      { username: "sarah_johnson", password: "password", firstName: "Sarah", lastName: "Johnson", email: "sarah@ranch-partners.com", role: "partner" },
      { username: "mike_wilson", password: "password", firstName: "Mike", lastName: "Wilson", email: "mike@ranch-partners.com", role: "partner" },
      { username: "david_brown", password: "password", firstName: "David", lastName: "Brown", email: "david@ranch-partners.com", role: "partner" }
    ];

    partners.forEach(partner => {
      const user: User = {
        id: this.currentUserId++,
        ...partner,
        profileImageUrl: null,
        isActive: true,
        lastActiveAt: new Date(),
        createdAt: new Date()
      };
      this.users.set(user.id, user);
    });

    // Sample livestock
    const animals = [
      { tagId: "C-001", breed: "Angus", gender: "female", weight: "1200", healthStatus: "healthy", location: "Pasture A" },
      { tagId: "C-002", breed: "Hereford", gender: "male", weight: "1350", healthStatus: "monitoring", location: "Pasture B" },
      { tagId: "C-003", breed: "Charolais", gender: "female", weight: "980", healthStatus: "healthy", location: "Pasture A" }
    ];

    animals.forEach(animal => {
      const livestock: Livestock = {
        id: this.currentLivestockId++,
        ...animal,
        birthDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3), // Random age up to 3 years
        purchasePrice: (Math.random() * 2000 + 1000).toString(),
        purchaseDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        notes: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.livestock.set(livestock.id, livestock);
    });

    // Sample transactions
    const transactionData = [
      { type: "income", category: "livestock_sales", description: "Cattle Sale - Buyer ABC Corp", amount: "12500", date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { type: "expense", category: "feed_supplies", description: "Feed Purchase - Ranch Supply Co", amount: "3200", date: new Date(Date.now() - 48 * 60 * 60 * 1000) },
      { type: "expense", category: "maintenance", description: "Equipment Maintenance", amount: "850", date: new Date(Date.now() - 72 * 60 * 60 * 1000) }
    ];

    transactionData.forEach(txn => {
      const transaction: Transaction = {
        id: this.currentTransactionId++,
        ...txn,
        date: txn.date,
        partnerId: 1,
        livestockId: null,
        receiptUrl: null,
        notes: null,
        createdAt: new Date()
      };
      this.transactions.set(transaction.id, transaction);
    });

    // Sample inventory
    const inventoryData = [
      { name: "Cattle Feed Premium", category: "feed", quantity: "1245", unit: "tons", minStockLevel: "500", costPerUnit: "250" },
      { name: "Hay Bales", category: "feed", quantity: "850", unit: "bales", minStockLevel: "200", costPerUnit: "15" },
      { name: "Antibiotics", category: "medicine", quantity: "25", unit: "bottles", minStockLevel: "10", costPerUnit: "45" }
    ];

    inventoryData.forEach(item => {
      const inventory: Inventory = {
        id: this.currentInventoryId++,
        ...item,
        supplier: "Ranch Supply Co",
        lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        expiryDate: null,
        location: "Main Storage",
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.inventory.set(inventory.id, inventory);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isActive: true,
      lastActiveAt: new Date(),
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserLastActive(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastActiveAt = new Date();
      this.users.set(id, user);
    }
  }

  // Livestock operations
  async getAllLivestock(): Promise<Livestock[]> {
    return Array.from(this.livestock.values()).filter(animal => animal.isActive);
  }

  async getLivestock(id: number): Promise<Livestock | undefined> {
    return this.livestock.get(id);
  }

  async getLivestockByTagId(tagId: string): Promise<Livestock | undefined> {
    return Array.from(this.livestock.values()).find(animal => animal.tagId === tagId);
  }

  async createLivestock(insertLivestock: InsertLivestock): Promise<Livestock> {
    const id = this.currentLivestockId++;
    const livestock: Livestock = {
      ...insertLivestock,
      id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.livestock.set(id, livestock);
    return livestock;
  }

  async updateLivestock(id: number, updates: Partial<InsertLivestock>): Promise<Livestock> {
    const existing = this.livestock.get(id);
    if (!existing) throw new Error("Livestock not found");
    
    const updated: Livestock = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.livestock.set(id, updated);
    return updated;
  }

  async deleteLivestock(id: number): Promise<void> {
    const existing = this.livestock.get(id);
    if (existing) {
      existing.isActive = false;
      this.livestock.set(id, existing);
    }
  }

  async getLivestockStats(): Promise<{ total: number; healthy: number; monitoring: number; sick: number; }> {
    const animals = Array.from(this.livestock.values()).filter(animal => animal.isActive);
    return {
      total: animals.length,
      healthy: animals.filter(a => a.healthStatus === "healthy").length,
      monitoring: animals.filter(a => a.healthStatus === "monitoring").length,
      sick: animals.filter(a => a.healthStatus === "sick").length
    };
  }

  // Transaction operations
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, updates: Partial<InsertTransaction>): Promise<Transaction> {
    const existing = this.transactions.get(id);
    if (!existing) throw new Error("Transaction not found");
    
    const updated: Transaction = { ...existing, ...updates };
    this.transactions.set(id, updated);
    return updated;
  }

  async deleteTransaction(id: number): Promise<void> {
    this.transactions.delete(id);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(txn => {
      const txnDate = new Date(txn.date);
      return txnDate >= startDate && txnDate <= endDate;
    });
  }

  async getFinancialSummary(): Promise<{ totalIncome: number; totalExpenses: number; netProfit: number; monthlyRevenue: number; }> {
    const transactions = Array.from(this.transactions.values());
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyTransactions = transactions.filter(txn => new Date(txn.date) >= monthStart);
    
    const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const monthlyRevenue = monthlyTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      monthlyRevenue
    };
  }

  // Inventory operations
  async getAllInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getInventory(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async createInventory(insertInventory: InsertInventory): Promise<Inventory> {
    const id = this.currentInventoryId++;
    const inventory: Inventory = {
      ...insertInventory,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.inventory.set(id, inventory);
    return inventory;
  }

  async updateInventory(id: number, updates: Partial<InsertInventory>): Promise<Inventory> {
    const existing = this.inventory.get(id);
    if (!existing) throw new Error("Inventory item not found");
    
    const updated: Inventory = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.inventory.set(id, updated);
    return updated;
  }

  async deleteInventory(id: number): Promise<void> {
    this.inventory.delete(id);
  }

  async getLowStockItems(): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(item => {
      const quantity = parseFloat(item.quantity);
      const minStock = parseFloat(item.minStockLevel || "0");
      return quantity <= minStock;
    });
  }

  // Health record operations
  async getAllHealthRecords(): Promise<HealthRecord[]> {
    return Array.from(this.healthRecords.values());
  }

  async getHealthRecordsByLivestock(livestockId: number): Promise<HealthRecord[]> {
    return Array.from(this.healthRecords.values()).filter(record => record.livestockId === livestockId);
  }

  async createHealthRecord(insertRecord: InsertHealthRecord): Promise<HealthRecord> {
    const id = this.currentHealthRecordId++;
    const record: HealthRecord = {
      ...insertRecord,
      id,
      createdAt: new Date()
    };
    this.healthRecords.set(id, record);
    return record;
  }

  async getUpcomingHealthTasks(): Promise<HealthRecord[]> {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return Array.from(this.healthRecords.values()).filter(record => {
      if (!record.nextDueDate) return false;
      const dueDate = new Date(record.nextDueDate);
      return dueDate >= now && dueDate <= nextWeek;
    });
  }
}

export const storage = new MemStorage();
