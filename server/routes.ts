import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageTemplateSchema, insertLeadSchema, insertServiceRequestSchema } from "@shared/schema";
import { conversationFlowEngine } from "./conversationFlow";
import { whatsappService } from "./whatsapp";
import { notificationService } from "./notifications";
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

  app.get("/api/conversation-states", async (req, res) => {
    try {
      const { phone } = req.query;
      const states = await storage.getConversationStates(phone as string | undefined);
      
      if (phone && states.length === 0) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      
      if (phone && states.length === 1) {
        return res.json(states[0]);
      }
      
      res.json(states);
    } catch (error) {
      console.error("Error fetching conversation states:", error);
      res.status(500).json({ error: "Failed to fetch conversation states" });
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
        console.log("Webhook: No incoming message parsed");
        return res.status(200).send("OK");
      }

      console.log("Webhook: Incoming message from", incomingMessage.customerPhone, "type:", incomingMessage.messageType);

      const result = await conversationFlowEngine.handleIncomingMessage(incomingMessage);

      console.log("Webhook: Conversation result - shouldSend:", result.shouldSend, "hasTemplate:", !!result.template, "error:", result.error);

      if (result.error) {
        console.error("Conversation flow error:", result.error);
        return res.status(200).send("OK");
      }

      if (result.shouldSend && result.template) {
        console.log("Webhook: Sending reply to", incomingMessage.customerPhone, "template:", result.template.name);
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

  app.post("/api/whatsapp/upload-media", async (req, res) => {
    try {
      const { filePath, mimeType } = req.body;
      
      if (!filePath || !mimeType) {
        return res.status(400).json({ error: "filePath and mimeType are required" });
      }

      const result = await whatsappService.uploadMedia(filePath, mimeType);
      
      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({ mediaId: result.mediaId });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ error: "Failed to upload media" });
    }
  });

  // Leads API with auto-notifications
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      
      // Send WhatsApp notification
      await notificationService.sendLeadNotification(lead, "created");
      
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(400).json({ error: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.partial().parse(req.body);
      const lead = await storage.updateLead(req.params.id, validatedData);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Send WhatsApp notification
      await notificationService.sendLeadNotification(lead, "updated");
      
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(400).json({ error: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const success = await storage.deleteLead(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  // Service Requests API with auto-notifications
  app.get("/api/service-requests", async (req, res) => {
    try {
      const requests = await storage.getServiceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.get("/api/service-requests/:id", async (req, res) => {
    try {
      const request = await storage.getServiceRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Service request not found" });
      }
      res.json(request);
    } catch (error) {
      console.error("Error fetching service request:", error);
      res.status(500).json({ error: "Failed to fetch service request" });
    }
  });

  app.post("/api/service-requests", async (req, res) => {
    try {
      const validatedData = insertServiceRequestSchema.parse(req.body);
      const request = await storage.createServiceRequest(validatedData);
      
      // Send WhatsApp notification
      await notificationService.sendServiceRequestNotification(request, "created");
      
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating service request:", error);
      res.status(400).json({ error: "Failed to create service request" });
    }
  });

  app.put("/api/service-requests/:id", async (req, res) => {
    try {
      const validatedData = insertServiceRequestSchema.partial().parse(req.body);
      const request = await storage.updateServiceRequest(req.params.id, validatedData);
      if (!request) {
        return res.status(404).json({ error: "Service request not found" });
      }
      
      // Send WhatsApp notification
      await notificationService.sendServiceRequestNotification(request, "updated");
      
      res.json(request);
    } catch (error) {
      console.error("Error updating service request:", error);
      res.status(400).json({ error: "Failed to update service request" });
    }
  });

  app.delete("/api/service-requests/:id", async (req, res) => {
    try {
      const success = await storage.deleteServiceRequest(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Service request not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service request:", error);
      res.status(500).json({ error: "Failed to delete service request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
