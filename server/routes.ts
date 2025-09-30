import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageTemplateSchema } from "@shared/schema";
import { conversationFlowEngine } from "./conversationFlow";
import { z } from "zod";

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

  // Conversation Flow API
  const startConversationSchema = z.object({
    customerPhone: z.string(),
    customerName: z.string(),
    flowType: z.enum(["campaign_lead", "service_request"]),
  });

  const incomingMessageSchema = z.object({
    customerPhone: z.string(),
    customerName: z.string().optional(),
    messageType: z.enum(["text", "button", "list"]),
    content: z.string(),
    selectedButtonId: z.string().optional(),
    selectedListItemId: z.string().optional(),
  });

  app.post("/api/conversations/start", async (req, res) => {
    try {
      const data = startConversationSchema.parse(req.body);
      const result = await conversationFlowEngine.startNewConversation(
        data.customerPhone,
        data.customerName,
        data.flowType
      );
      
      if (!result.shouldSend) {
        return res.status(400).json({ error: result.error || "Failed to start conversation" });
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error starting conversation:", error);
      res.status(400).json({ error: "Failed to start conversation" });
    }
  });

  app.post("/api/conversations/message", async (req, res) => {
    try {
      const data = incomingMessageSchema.parse(req.body);
      const result = await conversationFlowEngine.handleIncomingMessage(data);
      
      if (!result.shouldSend && result.error) {
        return res.status(400).json({ error: result.error });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(400).json({ error: "Failed to process message" });
    }
  });

  app.get("/api/conversations/:phone", async (req, res) => {
    try {
      const state = await storage.getConversationState(req.params.phone);
      if (!state) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(state);
    } catch (error) {
      console.error("Error fetching conversation state:", error);
      res.status(500).json({ error: "Failed to fetch conversation state" });
    }
  });

  app.delete("/api/conversations/:phone", async (req, res) => {
    try {
      const success = await storage.deleteConversationState(req.params.phone);
      if (!success) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  app.get("/api/whatsapp-logs", async (req, res) => {
    try {
      const { customerPhone, limit } = req.query;
      const logs = await storage.getWhatsappLogs(
        customerPhone as string | undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching WhatsApp logs:", error);
      res.status(500).json({ error: "Failed to fetch WhatsApp logs" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
