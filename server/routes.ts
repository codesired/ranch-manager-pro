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

  app.get("/api/livestock/stats", isAuthenticated, async (req, res) => {
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
      // Convert date strings to Date objects
      const processedData = {
        ...req.body,
        birthDate: req.body.birthDate ? new Date(req.body.birthDate) : undefined,
        purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
        lastHealthCheck: req.body.lastHealthCheck ? new Date(req.body.lastHealthCheck) : undefined
      };
      const validatedData = insertLivestockSchema.parse(processedData);
      const livestock = await storage.createLivestock(validatedData);
      res.json(livestock);
    } catch (error: any) {
      console.error("Error creating livestock:", error);
      res.status(400).json({ message: "Failed to create livestock", error: error.message });
    }
  });

  app.put("/api/livestock/:id", isAuthenticated, requireRole(['admin', 'owner', 'partner']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Convert date strings to Date objects
      const processedData = {
        ...req.body,
        birthDate: req.body.birthDate ? new Date(req.body.birthDate) : undefined,
        purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
        lastHealthCheck: req.body.lastHealthCheck ? new Date(req.body.lastHealthCheck) : undefined
      };
      const validatedData = insertLivestockSchema.partial().parse(processedData);
      const livestock = await storage.updateLivestock(id, validatedData);
      res.json(livestock);
    } catch (error: any) {
      console.error("Error updating livestock:", error);
      res.status(400).json({ message: "Failed to update livestock", error: error.message });
    }
  });

  app.delete("/api/livestock/:id", isAuthenticated, requireRole(['admin', 'owner']), async (req, res) => {
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

  app.get("/api/transactions/summary", isAuthenticated, async (req, res) => {
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
      // Convert date string to Date object
      const processedData = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : new Date()
      };
      const validatedData = insertTransactionSchema.parse(processedData);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: "Failed to create transaction", error: error.message });
    }
  });

  app.put("/api/transactions/:id", isAuthenticated, requireRole(['admin', 'owner', 'partner']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Convert date string to Date object
      const processedData = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined
      };
      const validatedData = insertTransactionSchema.partial().parse(processedData);
      const transaction = await storage.updateTransaction(id, validatedData);
      res.json(transaction);
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      res.status(400).json({ message: "Failed to update transaction", error: error.message });
    }
  });

  app.delete("/api/transactions/:id", isAuthenticated, requireRole(['admin', 'owner']), async (req, res) => {
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

  app.get("/api/inventory/low-stock", isAuthenticated, async (req, res) => {
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
      // Convert date strings to Date objects
      const processedData = {
        ...req.body,
        lastRestocked: req.body.lastRestocked ? new Date(req.body.lastRestocked) : undefined,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined
      };
      const validatedData = insertInventorySchema.parse(processedData);
      const inventory = await storage.createInventory(validatedData);
      res.json(inventory);
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      res.status(400).json({ message: "Failed to create inventory item", error: error.message });
    }
  });

  app.put("/api/inventory/:id", isAuthenticated, requireRole(['admin', 'owner', 'partner']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // Convert date strings to Date objects
      const processedData = {
        ...req.body,
        lastRestocked: req.body.lastRestocked ? new Date(req.body.lastRestocked) : undefined,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined
      };
      const validatedData = insertInventorySchema.partial().parse(processedData);
      const inventory = await storage.updateInventory(id, validatedData);
      res.json(inventory);
    } catch (error: any) {
      console.error("Error updating inventory item:", error);
      res.status(400).json({ message: "Failed to update inventory item", error: error.message });
    }
  });

  // Partners routes
  app.get("/api/partners", isAuthenticated, async (req, res) => {
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

  app.get("/api/health-records/upcoming", isAuthenticated, async (req, res) => {
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
      // Convert date strings to Date objects
      const processedData = {
        ...req.body,
        treatmentDate: req.body.treatmentDate ? new Date(req.body.treatmentDate) : new Date(),
        nextDueDate: req.body.nextDueDate ? new Date(req.body.nextDueDate) : undefined
      };
      const validatedData = insertHealthRecordSchema.parse(processedData);
      const record = await storage.createHealthRecord(validatedData);
      res.json(record);
    } catch (error: any) {
      console.error("Error creating health record:", error);
      res.status(400).json({ message: "Failed to create health record", error: error.message });
    }
  });

  // Delete endpoints for inventory
  app.delete("/api/inventory/:id", isAuthenticated, requireRole(['admin', 'owner']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteInventory(id);
      res.json({ message: "Inventory item deleted successfully" });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Reports and export endpoints
  app.get("/api/reports/livestock", isAuthenticated, async (req, res) => {
    try {
      const livestock = await storage.getAllLivestock();
      const stats = await storage.getLivestockStats();
      
      const report = {
        summary: stats,
        data: livestock,
        generatedAt: new Date(),
        type: 'livestock'
      };
      
      res.json(report);
    } catch (error) {
      console.error("Error generating livestock report:", error);
      res.status(500).json({ message: "Failed to generate livestock report" });
    }
  });

  app.get("/api/reports/financial", isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      const summary = await storage.getFinancialSummary();
      
      const report = {
        summary,
        data: transactions,
        generatedAt: new Date(),
        type: 'financial'
      };
      
      res.json(report);
    } catch (error) {
      console.error("Error generating financial report:", error);
      res.status(500).json({ message: "Failed to generate financial report" });
    }
  });

  app.get("/api/reports/inventory", isAuthenticated, async (req, res) => {
    try {
      const inventory = await storage.getAllInventory();
      const lowStock = await storage.getLowStockItems();
      
      const report = {
        summary: {
          totalItems: inventory.length,
          lowStockItems: lowStock.length,
          totalValue: inventory.reduce((sum, item) => {
            const quantity = parseFloat(item.quantity || "0");
            const cost = parseFloat(item.costPerUnit || "0");
            return sum + (quantity * cost);
          }, 0)
        },
        data: inventory,
        lowStockItems: lowStock,
        generatedAt: new Date(),
        type: 'inventory'
      };
      
      res.json(report);
    } catch (error) {
      console.error("Error generating inventory report:", error);
      res.status(500).json({ message: "Failed to generate inventory report" });
    }
  });

  // Export endpoints
  app.get("/api/export/csv/:type", isAuthenticated, async (req, res) => {
    try {
      const { type } = req.params;
      let data: any[] = [];
      let filename = '';
      
      switch (type) {
        case 'livestock':
          data = await storage.getAllLivestock();
          filename = 'livestock_export.csv';
          break;
        case 'transactions':
          data = await storage.getAllTransactions();
          filename = 'transactions_export.csv';
          break;
        case 'inventory':
          data = await storage.getAllInventory();
          filename = 'inventory_export.csv';
          break;
        default:
          return res.status(400).json({ message: "Invalid export type" });
      }
      
      // Convert to CSV format
      if (data.length === 0) {
        return res.status(404).json({ message: "No data to export" });
      }
      
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        ).join(',')
      );
      
      const csv = [headers, ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Admin control endpoints
  app.put("/api/admin/users/:id/role", isAuthenticated, requireRole(['owner']), async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      
      if (!['owner', 'admin', 'partner'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updatedUser = await storage.upsertUser({ id: userId, role });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, requireRole(['owner']), async (req, res) => {
    try {
      // For safety, we don't actually delete users, just deactivate them
      const userId = req.params.id;
      const updatedUser = await storage.upsertUser({ id: userId, isActive: false });
      res.json({ message: "User deactivated successfully", user: updatedUser });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
