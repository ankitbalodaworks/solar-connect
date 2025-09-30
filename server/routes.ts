import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageTemplateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Message Templates API
  app.get("/api/message-templates", async (req, res) => {
    try {
      const { flowType, language, stepKey } = req.query;
      const templates = await storage.getMessageTemplates(
        flowType as string | undefined,
        language as string | undefined,
        stepKey as string | undefined
      );
      res.json(templates);
    } catch (error) {
      console.error("Error fetching message templates:", error);
      res.status(500).json({ error: "Failed to fetch message templates" });
    }
  });

  app.get("/api/message-templates/:id", async (req, res) => {
    try {
      const template = await storage.getMessageTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching message template:", error);
      res.status(500).json({ error: "Failed to fetch message template" });
    }
  });

  app.post("/api/message-templates", async (req, res) => {
    try {
      const validatedData = insertMessageTemplateSchema.parse(req.body);
      const template = await storage.createMessageTemplate(validatedData);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating message template:", error);
      res.status(400).json({ error: "Failed to create message template" });
    }
  });

  app.put("/api/message-templates/:id", async (req, res) => {
    try {
      const validatedData = insertMessageTemplateSchema.partial().parse(req.body);
      const template = await storage.updateMessageTemplate(req.params.id, validatedData);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating message template:", error);
      res.status(400).json({ error: "Failed to update message template" });
    }
  });

  app.delete("/api/message-templates/:id", async (req, res) => {
    try {
      const success = await storage.deleteMessageTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting message template:", error);
      res.status(500).json({ error: "Failed to delete message template" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
