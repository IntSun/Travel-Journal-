import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEntrySchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ============================================
  // USER ROUTES
  // ============================================

  // Get user by ID
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user by username (includes password for login verification)
  // WARNING: In production, implement proper authentication with JWT/bcrypt
  app.get("/api/users/username/:username", async (req: Request, res: Response) => {
    try {
      console.log(`[API] Getting user by username: ${req.params.username}`);
      const user = await storage.getUserByUsername(req.params.username);
      if (!user) {
        console.log(`[API] User not found: ${req.params.username}`);
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`[API] User found: ${req.params.username}`);
      // For now, send password for client-side verification
      // TODO: Implement proper backend authentication
      res.json(user);
    } catch (error: any) {
      console.error(`[API] Error getting user:`, error.message);
      console.error(`[API] Full error:`, error);
      res.status(500).json({ 
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Create new user (register)
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(result.data);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user
  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const result = insertUserSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const user = await storage.updateUser(req.params.id, result.data);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============================================
  // JOURNAL ENTRY ROUTES
  // ============================================

  // Get all entries (public, for landing page)
  app.get("/api/entries", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const entries = await storage.getAllEntries(limit);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all entries for a user
  app.get("/api/entries/user/:userId", async (req: Request, res: Response) => {
    try {
      const entries = await storage.getEntriesByUserId(req.params.userId);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Search entries for a user
  app.get("/api/entries/user/:userId/search", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const entries = await storage.searchEntries(req.params.userId, query);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single entry by ID
  app.get("/api/entries/:id", async (req: Request, res: Response) => {
    try {
      const entry = await storage.getEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create new entry
  app.post("/api/entries", async (req: Request, res: Response) => {
    try {
      const result = insertEntrySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const entry = await storage.createEntry(result.data);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update entry
  app.patch("/api/entries/:id", async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const result = insertEntrySchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: fromZodError(result.error).message 
        });
      }

      const entry = await storage.updateEntry(req.params.id, userId, result.data);
      if (!entry) {
        return res.status(404).json({ 
          message: "Entry not found or you don't have permission to update it" 
        });
      }

      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete entry
  app.delete("/api/entries/:id", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }

      const success = await storage.deleteEntry(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ 
          message: "Entry not found or you don't have permission to delete it" 
        });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Debug endpoint to check environment
  app.get("/api/debug/env", (_req: Request, res: Response) => {
    res.json({
      hasMongoUri: !!process.env.MONGODB_URI,
      mongoUriPrefix: process.env.MONGODB_URI?.substring(0, 20) || "not set",
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
    });
  });

  return httpServer;
}
