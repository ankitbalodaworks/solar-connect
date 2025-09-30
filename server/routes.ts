import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageTemplateSchema } from "@shared/schema";
import { conversationFlowEngine } from "./conversationFlow";
import { whatsappService } from "./whatsapp";
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

  // WhatsApp Webhook Routes
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"] as string;
    const token = req.query["hub.verify_token"] as string;
    const challenge = req.query["hub.challenge"] as string;

    const verifiedChallenge = whatsappService.verifyWebhook(mode, token, challenge);
    
    if (verifiedChallenge) {
      res.status(200).send(verifiedChallenge);
    } else {
      res.status(403).send("Forbidden");
    }
  });

  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const signature = req.headers["x-hub-signature-256"] as string;
      
      if (!signature) {
        console.error("Missing webhook signature");
        return res.status(403).send("Forbidden");
      }

      const rawBody = (req.body as Buffer).toString("utf8");
      
      if (!whatsappService.verifyWebhookSignature(signature, rawBody)) {
        console.error("Invalid webhook signature");
        return res.status(403).send("Forbidden");
      }

      const webhookData = JSON.parse(rawBody);
      const incomingMessage = whatsappService.parseIncomingMessage(webhookData);
      
      if (!incomingMessage) {
        return res.status(200).send("OK");
      }

      const result = await conversationFlowEngine.handleIncomingMessage(incomingMessage);

      if (result.error) {
        console.error("Conversation flow error:", result.error);
        return res.status(200).send("OK");
      }

      if (result.shouldSend && result.template) {
        const sendResult = await whatsappService.sendTemplateMessage(
          incomingMessage.customerPhone,
          result.template
        );

        if (sendResult.success) {
          await storage.createWhatsappLog({
            customerPhone: incomingMessage.customerPhone,
            direction: "outbound",
            messageType: result.template.messageType,
            content: {
              bodyText: result.template.bodyText,
              headerText: result.template.headerText,
              footerText: result.template.footerText,
              buttons: result.template.buttons,
              listSections: result.template.listSections,
              messageId: sendResult.messageId,
            },
            status: "sent",
          });
        } else {
          console.error("WhatsApp send error:", sendResult.error);
          await storage.createWhatsappLog({
            customerPhone: incomingMessage.customerPhone,
            direction: "outbound",
            messageType: result.template.messageType,
            content: {
              bodyText: result.template.bodyText,
              error: sendResult.error,
            },
            status: "failed",
          });
        }
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Error processing WhatsApp webhook:", error);
      res.status(200).send("OK");
    }
  });

  const sendMessageSchema = z.object({
    customerPhone: z.string(),
    customerName: z.string(),
    flowType: z.enum(["campaign_lead", "service_request"]),
  });

  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      if (!whatsappService.isConfigured()) {
        return res.status(400).json({ error: "WhatsApp is not configured. Please add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to your environment." });
      }

      const data = sendMessageSchema.parse(req.body);
      
      const conversationResult = await conversationFlowEngine.startNewConversation(
        data.customerPhone,
        data.customerName,
        data.flowType
      );

      if (!conversationResult.shouldSend || !conversationResult.template) {
        return res.status(400).json({ error: conversationResult.error || "Failed to start conversation" });
      }

      const sendResult = await whatsappService.sendTemplateMessage(
        data.customerPhone,
        conversationResult.template
      );

      if (!sendResult.success) {
        return res.status(500).json({ error: sendResult.error || "Failed to send WhatsApp message" });
      }

      await storage.createWhatsappLog({
        customerPhone: data.customerPhone,
        direction: "outbound",
        messageType: conversationResult.template.messageType,
        content: {
          bodyText: conversationResult.template.bodyText,
          headerText: conversationResult.template.headerText,
          footerText: conversationResult.template.footerText,
          buttons: conversationResult.template.buttons,
          listSections: conversationResult.template.listSections,
        },
        status: "sent",
      });

      res.json({ 
        success: true, 
        messageId: sendResult.messageId,
        template: conversationResult.template 
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ error: "Failed to send WhatsApp message" });
    }
  });

  app.get("/api/whatsapp/status", (req, res) => {
    const configured = whatsappService.isConfigured();
    res.json({ 
      configured,
      message: configured 
        ? "WhatsApp is configured and ready" 
        : "WhatsApp is not configured. Add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to environment."
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
