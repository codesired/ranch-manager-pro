import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLivestockSchema, insertTransactionSchema, insertInventorySchema, insertHealthRecordSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, requireRole } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Livestock routes
  app.get("/api/livestock", isAuthenticated, async (req, res) => {
    try {
      const livestock = await storage.getAllLivestock();
      res.json(livestock);
    } catch (error) {
      console.error("Error fetching livestock:", error);
      res.status(500).json({ message: "Failed to fetch livestock" });
    }
  });

  app.get("/api/livestock/stats", async (req, res) => {
    try {
      const stats = await storage.getLivestockStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching livestock stats:", error);
      res.status(500).json({ message: "Failed to fetch livestock stats" });
    }
  });

  app.post("/api/livestock", isAuthenticated, requireRole(['admin', 'owner', 'partner']), async (req, res) => {
    try {
      const validatedData = insertLivestockSchema.parse(req.body);
      const livestock = await storage.createLivestock(validatedData);
      res.json(livestock);
    } catch (error: any) {
      console.error("Error creating livestock:", error);
      res.status(400).json({ message: "Failed to create livestock", error: error.message });
    }
  });

  app.put("/api/livestock/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertLivestockSchema.partial().parse(req.body);
      const livestock = await storage.updateLivestock(id, validatedData);
      res.json(livestock);
    } catch (error: any) {
      console.error("Error updating livestock:", error);
      res.status(400).json({ message: "Failed to update livestock", error: error.message });
    }
  });

  app.delete("/api/livestock/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLivestock(id);
      res.json({ message: "Livestock deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting livestock:", error);
      res.status(500).json({ message: "Failed to delete livestock" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/summary", async (req, res) => {
    try {
      const summary = await storage.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  app.post("/api/transactions", isAuthenticated, requireRole(['admin', 'owner', 'partner']), async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction", error: error.message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id);
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.getAllInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.post("/api/inventory", isAuthenticated, requireRole(['admin', 'owner', 'partner']), async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const inventory = await storage.createInventory(validatedData);
      res.json(inventory);
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ message: "Failed to create inventory item", error: error.message });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInventorySchema.partial().parse(req.body);
      const inventory = await storage.updateInventory(id, validatedData);
      res.json(inventory);
    } catch (error: any) {
      console.error("Error updating inventory item:", error);
      res.status(400).json({ message: "Failed to update inventory item", error: error.message });
    }
  });

  // Partners routes
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getAllUsers();
      res.json(partners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      res.status(500).json({ message: "Failed to fetch partners" });
    }
  });

  // Health records routes
  app.get("/api/health-records", isAuthenticated, async (req, res) => {
    try {
      const records = await storage.getAllHealthRecords();
      res.json(records);
    } catch (error) {
      console.error("Error fetching health records:", error);
      res.status(500).json({ message: "Failed to fetch health records" });
    }
  });

  app.get("/api/health-records/upcoming", async (req, res) => {
    try {
      const upcoming = await storage.getUpcomingHealthTasks();
      res.json(upcoming);
    } catch (error) {
      console.error("Error fetching upcoming health tasks:", error);
      res.status(500).json({ message: "Failed to fetch upcoming health tasks" });
    }
  });

  app.post("/api/health-records", isAuthenticated, requireRole(['admin', 'owner', 'partner']), async (req, res) => {
    try {
      const validatedData = insertHealthRecordSchema.parse(req.body);
      const record = await storage.createHealthRecord(validatedData);
      res.json(record);
    } catch (error: any) {
      console.error("Error creating health record:", error);
      res.status(400).json({ message: "Failed to create health record", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
