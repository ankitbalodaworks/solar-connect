import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageTemplateSchema, insertCustomerSchema, insertLeadSchema, insertServiceRequestSchema } from "@shared/schema";
import { conversationFlowEngine } from "./conversationFlow";
import { whatsappService } from "./whatsapp";
import { notificationService } from "./notifications";
import { allMetaTemplates } from "./metaTemplates";
import { FlowHandlers } from "./flowHandlers";
import { ALL_FLOWS } from "./whatsappFlows";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Health Check endpoint for Render.com and other monitoring services
  app.get("/health", (req, res) => {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      service: "Sunshine Power WhatsApp Platform"
    });
  });

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
      
      // Reset Meta approval status when template is modified
      // This allows re-submission after changes
      const updateData = {
        ...validatedData,
        metaStatus: "draft" as const,
        metaTemplateId: null,
        metaStatusUpdatedAt: null,
        submissionError: null,
      };
      
      const template = await storage.updateMessageTemplate(req.params.id, updateData);
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

  // Helper function to map database template to Meta template name
  const getMetaTemplateName = (flowType: string, stepKey: string, language: string): string => {
    // Construct Meta template name based on stepKey and language
    // Pattern: sunshine_{stepKey}_{language} (e.g., sunshine_main_menu_en)
    // Exception: campaign_entry is English only (sunshine_welcome)
    
    if (stepKey === "campaign_entry") {
      return "sunshine_welcome";
    }
    
    // Construct template name with language suffix
    const metaTemplateName = `sunshine_${stepKey}_${language}`;
    
    // Verify the template exists in allMetaTemplates
    const exists = allMetaTemplates.some(t => t.name === metaTemplateName);
    if (!exists) {
      throw new Error(`Meta template not found: ${metaTemplateName}. Step key "${stepKey}" may not have a Meta template definition.`);
    }
    
    return metaTemplateName;
  };

  // Submit a single template to Meta for approval
  app.post("/api/message-templates/:id/submit", async (req, res) => {
    try {
      const template = await storage.getMessageTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      if (!template.flowType || !template.stepKey || !template.language) {
        return res.status(400).json({ error: "Template flowType, stepKey, and language are required" });
      }

      // Normalize status for comparison (case-insensitive)
      const normalizedStatus = (template.metaStatus || "draft").toLowerCase();
      
      // Check if template is already approved or pending
      if (normalizedStatus === "approved") {
        return res.status(400).json({ error: "Template is already approved" });
      }
      if (normalizedStatus === "pending") {
        return res.status(400).json({ error: "Template submission is already pending" });
      }

      // Find the matching Meta template definition using flowType, stepKey, and language
      let metaTemplateName: string;
      try {
        metaTemplateName = getMetaTemplateName(template.flowType, template.stepKey, template.language);
      } catch (mappingError: any) {
        console.error(`Template "${template.name}" does not require Meta approval: ${mappingError.message}`);
        return res.status(400).json({ 
          error: "This template does not require Meta approval. Form field templates are sent as interactive messages within active conversations and do not need pre-approval." 
        });
      }

      const metaTemplate = allMetaTemplates.find((t) => t.name === metaTemplateName);
      
      if (!metaTemplate) {
        console.error(`Meta template not found for: ${template.id} (${template.name})`);
        console.error(`  Looking for: ${metaTemplateName}`);
        console.error(`  flowType: ${template.flowType}, stepKey: ${template.stepKey}, language: ${template.language}`);
        console.error(`  Available Meta templates: ${allMetaTemplates.map(t => t.name).join(", ")}`);
        return res.status(400).json({ 
          error: "This template does not require Meta approval. Form field templates are sent as interactive messages within active conversations and do not need pre-approval." 
        });
      }

      console.log(`✓ Matched DB template "${template.id}" (${template.name}) to Meta template "${metaTemplateName}"`);


      // Submit to Meta
      const result = await whatsappService.submitSingleTemplate(metaTemplate);
      
      if (result.success) {
        // Check if this is a "template already exists" case
        if (result.alreadyExists && result.status) {
          // Template already exists in Meta - map the synced status
          let dbStatus: "draft" | "pending" | "approved" | "rejected" = "draft";
          const metaStatus = result.status.toUpperCase();
          
          if (metaStatus === "APPROVED") {
            dbStatus = "approved";
          } else if (metaStatus === "PENDING" || metaStatus === "IN_APPEAL") {
            dbStatus = "pending";
          } else if (metaStatus === "REJECTED" || metaStatus === "DISABLED") {
            dbStatus = "rejected";
          }
          
          const updated = await storage.updateMessageTemplate(req.params.id, {
            metaTemplateId: result.id,
            metaStatus: dbStatus,
            metaStatusUpdatedAt: new Date(),
            submissionError: null,
          });
          
          res.json({ 
            success: true, 
            template: updated,
            message: `Template already exists in Meta with status: ${dbStatus}. To make changes, please delete the existing template in Meta first or create a new template with a different name.`
          });
        } else {
          // Normal success - new template submitted
          const updated = await storage.updateMessageTemplate(req.params.id, {
            metaTemplateId: result.id,
            metaStatus: "pending",
            metaStatusUpdatedAt: new Date(),
            submissionError: null,
          });
          res.json({ success: true, template: updated });
        }
      } else {
        // Update template with error but NOT the status timestamp
        await storage.updateMessageTemplate(req.params.id, {
          submissionError: result.error,
        });
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      console.error("Error submitting template:", error);
      res.status(500).json({ error: "Failed to submit template" });
    }
  });

  // Sync template status from Meta
  app.post("/api/message-templates/:id/sync-status", async (req, res) => {
    try {
      const template = await storage.getMessageTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }

      if (!template.flowType || !template.stepKey || !template.language) {
        return res.status(400).json({ error: "Template flowType, stepKey, and language are required" });
      }

      // Find the matching Meta template name using flowType, stepKey, and language
      let metaTemplateName: string;
      try {
        metaTemplateName = getMetaTemplateName(template.flowType, template.stepKey, template.language);
      } catch (mappingError: any) {
        console.error(`Template "${template.name}" does not require Meta approval: ${mappingError.message}`);
        return res.status(400).json({ 
          error: "This template does not require Meta approval. Form field templates are sent as interactive messages within active conversations and do not need pre-approval." 
        });
      }

      // Fetch status from Meta using the Meta template name
      const result = await whatsappService.syncTemplateStatus(metaTemplateName);
      
      if (result.success && result.status) {
        // Map Meta status to our database status (normalize to lowercase)
        let dbStatus: "draft" | "pending" | "approved" | "rejected" = "draft";
        const metaStatus = result.status.toUpperCase();
        
        if (metaStatus === "APPROVED") {
          dbStatus = "approved";
        } else if (metaStatus === "PENDING" || metaStatus === "IN_APPEAL") {
          dbStatus = "pending";
        } else if (metaStatus === "REJECTED" || metaStatus === "DISABLED") {
          dbStatus = "rejected";
        } else if (metaStatus === "PAUSED") {
          // Keep existing status for paused templates
          dbStatus = (template.metaStatus || "draft") as any;
        } else {
          // Unknown status - preserve existing status and record error
          console.warn(`Unknown Meta template status: ${result.status}`);
          const updated = await storage.updateMessageTemplate(req.params.id, {
            submissionError: `Unknown Meta status: ${result.status}`,
          });
          return res.status(200).json({ 
            success: true, 
            template: updated,
            warning: `Unknown Meta status: ${result.status}` 
          });
        }

        // Update template status in database
        const updated = await storage.updateMessageTemplate(req.params.id, {
          metaTemplateId: result.id,
          metaStatus: dbStatus,
          metaStatusUpdatedAt: new Date(),
          submissionError: null,
        });
        res.json({ success: true, template: updated });
      } else {
        // Handle error based on status code
        const statusCode = result.statusCode || 500;
        if (statusCode === 404) {
          return res.status(404).json({ success: false, error: result.error || "Template not found on Meta" });
        } else {
          return res.status(statusCode).json({ success: false, error: result.error || "Failed to sync template status" });
        }
      }
    } catch (error) {
      console.error("Error syncing template status:", error);
      res.status(500).json({ error: "Failed to sync template status" });
    }
  });

  // Bulk submit all templates to Meta
  app.post("/api/message-templates/bulk-submit", async (req, res) => {
    try {
      const templates = await storage.getMessageTemplates();
      
      const results = {
        submitted: [] as string[],
        skipped: [] as string[],
        failed: [] as { id: string; name: string; error: string }[],
      };
      
      for (const template of templates) {
        // Skip if no required fields
        if (!template.flowType || !template.stepKey || !template.language) {
          results.skipped.push(template.name);
          continue;
        }
        
        // Skip if already approved or pending
        const normalizedStatus = (template.metaStatus || "draft").toLowerCase();
        if (normalizedStatus === "approved" || normalizedStatus === "pending") {
          results.skipped.push(template.name);
          continue;
        }
        
        // Find matching Meta template
        let metaTemplateName: string;
        try {
          metaTemplateName = getMetaTemplateName(template.flowType, template.stepKey, template.language);
        } catch (mappingError: any) {
          // This template doesn't require Meta approval
          results.skipped.push(template.name);
          continue;
        }
        
        const metaTemplate = allMetaTemplates.find((t) => t.name === metaTemplateName);
        if (!metaTemplate) {
          results.skipped.push(template.name);
          continue;
        }
        
        // Submit to Meta
        const result = await whatsappService.submitSingleTemplate(metaTemplate);
        
        if (result.success) {
          await storage.updateMessageTemplate(template.id, {
            metaTemplateId: result.id,
            metaStatus: "pending",
            metaStatusUpdatedAt: new Date(),
            submissionError: null,
          });
          results.submitted.push(template.name);
        } else {
          await storage.updateMessageTemplate(template.id, {
            submissionError: result.error,
          });
          results.failed.push({
            id: template.id,
            name: template.name,
            error: result.error || "Unknown error",
          });
        }
      }
      
      res.json({
        success: true,
        summary: {
          total: templates.length,
          submitted: results.submitted.length,
          skipped: results.skipped.length,
          failed: results.failed.length,
        },
        details: results,
      });
    } catch (error) {
      console.error("Error bulk submitting templates:", error);
      res.status(500).json({ error: "Failed to bulk submit templates" });
    }
  });

  // Conversation Flow API
  const startConversationSchema = z.object({
    customerPhone: z.string(),
    customerName: z.string(),
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
        data.customerName
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
      
      // Check for status updates (delivered, read, failed)
      const statusUpdate = whatsappService.parseStatusUpdate(webhookData);
      if (statusUpdate) {
        console.log(`WhatsApp status update: ${statusUpdate.status} for ${statusUpdate.recipientPhone}`);
        
        // Create event for status tracking
        await storage.createEvent({
          customerPhone: statusUpdate.recipientPhone,
          type: statusUpdate.status,
          meta: {
            messageId: statusUpdate.messageId,
            timestamp: statusUpdate.timestamp,
            ...(statusUpdate.status === "failed" && {
              errorMessage: statusUpdate.errorMessage,
              errorCode: statusUpdate.errorCode,
            }),
          },
        });
        
        if (statusUpdate.status === "failed") {
          console.error(`Message delivery failed to ${statusUpdate.recipientPhone}: ${statusUpdate.errorMessage} (Code: ${statusUpdate.errorCode})`);
        }
        return res.status(200).send("OK");
      }
      
      // Check for incoming messages
      const incomingMessage = whatsappService.parseIncomingMessage(webhookData);
      
      if (!incomingMessage) {
        return res.status(200).send("OK");
      }

      // Create event for incoming message (replied)
      await storage.createEvent({
        customerPhone: incomingMessage.customerPhone,
        type: "replied",
        meta: {
          messageType: incomingMessage.messageType,
          content: incomingMessage.content,
          buttonId: incomingMessage.selectedButtonId,
          listId: incomingMessage.selectedListItemId,
        },
      });

      const result = await conversationFlowEngine.handleIncomingMessage(incomingMessage);

      if (result.error) {
        console.error("Conversation flow error:", result.error);
        return res.status(200).send("OK");
      }

      // Create specific events based on conversation flow navigation
      if (incomingMessage.messageType === "button" || incomingMessage.messageType === "list") {
        const buttonOrListId = incomingMessage.selectedButtonId || incomingMessage.selectedListItemId;
        
        // Language selection events
        if (buttonOrListId === "hindi") {
          await storage.createEvent({
            customerPhone: incomingMessage.customerPhone,
            type: "language_selected_hi",
            meta: { language: "hi" },
          });
        } else if (buttonOrListId === "english") {
          await storage.createEvent({
            customerPhone: incomingMessage.customerPhone,
            type: "language_selected_en",
            meta: { language: "en" },
          });
        }
        
        // Menu selection events
        else if (buttonOrListId === "site_survey") {
          await storage.createEvent({
            customerPhone: incomingMessage.customerPhone,
            type: "menu_site_survey",
            meta: { menuChoice: "site_survey" },
          });
        } else if (buttonOrListId === "price_estimate") {
          await storage.createEvent({
            customerPhone: incomingMessage.customerPhone,
            type: "menu_price_estimate",
            meta: { menuChoice: "price_estimate" },
          });
        } else if (buttonOrListId === "help") {
          await storage.createEvent({
            customerPhone: incomingMessage.customerPhone,
            type: "menu_other_help",
            meta: { menuChoice: "help" },
          });
        }
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
  });

  app.post("/api/whatsapp/send", async (req, res) => {
    try {
      if (!whatsappService.isConfigured()) {
        return res.status(400).json({ error: "WhatsApp is not configured. Please add WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN to your environment." });
      }

      const data = sendMessageSchema.parse(req.body);
      
      const conversationResult = await conversationFlowEngine.startNewConversation(
        data.customerPhone,
        data.customerName
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

  // WhatsApp Flow data_exchange endpoints
  const flowHandlers = new FlowHandlers(storage);
  
  // Unified data_exchange endpoint for WhatsApp Flows (Meta expects this)
  app.get("/api/whatsapp/data-exchange", (req, res) => {
    res.status(200).json({
      success: true,
      message: "WhatsApp Flow Data Exchange endpoint is active",
      version: "3.0"
    });
  });

  app.post("/api/whatsapp/data-exchange", async (req, res) => {
    try {
      const body = req.body;
      
      // Decrypt the payload first if it's encrypted
      let decryptedData;
      try {
        decryptedData = flowHandlers.decryptFlowData(body);
      } catch (decryptError) {
        console.error("Error decrypting data_exchange payload:", decryptError);
        return res.status(400).json({ error: "Failed to decrypt payload" });
      }
      
      // Extract operation from decrypted data
      const op = decryptedData.data?.op;
      const screen = decryptedData.screen;
      const action = decryptedData.action?.toUpperCase();
      
      console.log('[DATA_EXCHANGE] Routing - op:', op, 'screen:', screen, 'action:', action);
      
      // Handle PING and INIT actions - need to determine flow type from flow_token
      if (action === "PING" || action === "INIT") {
        const flowToken = decryptedData.flow_token;
        const flowType = flowToken ? flowHandlers.extractFlowTypeFromToken(flowToken) : "survey";
        console.log('[DATA_EXCHANGE] INIT/PING - flowType from token:', flowType);
        
        if (flowType === "price") {
          return flowHandlers.handlePriceFlow(req, res);
        } else if (flowType === "service") {
          return flowHandlers.handleServiceFlow(req, res);
        } else if (flowType === "callback") {
          return flowHandlers.handleCallbackFlow(req, res);
        } else if (flowType === "trust") {
          return flowHandlers.handleTrustFlow(req, res);
        } else if (flowType === "eligibility") {
          return flowHandlers.handleEligibilityFlow(req, res);
        } else {
          return flowHandlers.handleSurveyFlow(req, res);
        }
      }
      
      // Route to appropriate flow handler based on operation or screen
      if (op === "submit_survey_form" || screen === "SURVEY_FORM") {
        console.log('[DATA_EXCHANGE] Routing to Survey handler');
        return flowHandlers.handleSurveyFlow(req, res);
      } else if (op === "submit_price_form" || screen === "PRICE_FORM") {
        console.log('[DATA_EXCHANGE] Routing to Price handler');
        return flowHandlers.handlePriceFlow(req, res);
      } else if (op === "submit_service_form" || screen === "SERVICE_FORM") {
        console.log('[DATA_EXCHANGE] Routing to Service handler');
        return flowHandlers.handleServiceFlow(req, res);
      } else if (op === "submit_callback_form" || screen === "CALLBACK_FORM") {
        console.log('[DATA_EXCHANGE] Routing to Callback handler');
        return flowHandlers.handleCallbackFlow(req, res);
      } else if (op === "show_trust_topic" || screen === "TRUST_MENU") {
        console.log('[DATA_EXCHANGE] Routing to Trust handler');
        return flowHandlers.handleTrustFlow(req, res);
      } else if (op === "eligibility_check" || screen === "ELIG_FORM") {
        console.log('[DATA_EXCHANGE] Routing to Eligibility handler');
        return flowHandlers.handleEligibilityFlow(req, res);
      } else {
        console.error('[DATA_EXCHANGE] Unknown operation - op:', op, 'screen:', screen);
        return res.status(400).json({ 
          error: "Unknown operation or screen",
          received: { op, screen, action }
        });
      }
    } catch (error) {
      console.error("Error in data_exchange endpoint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // English flow endpoints (serve English flow JSON definitions)
  app.get("/api/flows/survey", (req, res) => {
    res.json(ALL_FLOWS.SURVEY);
  });
  app.get("/api/flows/price", (req, res) => {
    res.json(ALL_FLOWS.PRICE);
  });
  app.get("/api/flows/service", (req, res) => {
    res.json(ALL_FLOWS.SERVICE);
  });
  app.get("/api/flows/callback", (req, res) => {
    res.json(ALL_FLOWS.CALLBACK);
  });
  app.get("/api/flows/trust", (req, res) => {
    res.json(ALL_FLOWS.TRUST);
  });
  app.get("/api/flows/eligibility", (req, res) => {
    res.json(ALL_FLOWS.ELIGIBILITY);
  });
  
  // English flow handlers (POST endpoints)
  app.post("/api/flows/survey", (req, res) => flowHandlers.handleSurveyFlow(req, res));
  app.post("/api/flows/price", (req, res) => flowHandlers.handlePriceFlow(req, res));
  app.post("/api/flows/service", (req, res) => flowHandlers.handleServiceFlow(req, res));
  app.post("/api/flows/callback", (req, res) => flowHandlers.handleCallbackFlow(req, res));
  app.post("/api/flows/trust", (req, res) => flowHandlers.handleTrustFlow(req, res));
  app.post("/api/flows/eligibility", (req, res) => flowHandlers.handleEligibilityFlow(req, res));
  
  // Hindi flow endpoints (serve Hindi flow JSON definitions)
  app.get("/api/flows/survey-hi", (req, res) => {
    res.json(ALL_FLOWS.SURVEY_HI);
  });
  app.get("/api/flows/price-hi", (req, res) => {
    res.json(ALL_FLOWS.PRICE_HI);
  });
  app.get("/api/flows/service-hi", (req, res) => {
    res.json(ALL_FLOWS.SERVICE_HI);
  });
  app.get("/api/flows/callback-hi", (req, res) => {
    res.json(ALL_FLOWS.CALLBACK_HI);
  });
  app.get("/api/flows/trust-hi", (req, res) => {
    res.json(ALL_FLOWS.TRUST_HI);
  });
  app.get("/api/flows/eligibility-hi", (req, res) => {
    res.json(ALL_FLOWS.ELIGIBILITY_HI);
  });
  
  // Hindi flow handlers (same as English, data structure is identical)
  app.post("/api/flows/survey-hi", (req, res) => flowHandlers.handleSurveyFlow(req, res));
  app.post("/api/flows/price-hi", (req, res) => flowHandlers.handlePriceFlow(req, res));
  app.post("/api/flows/service-hi", (req, res) => flowHandlers.handleServiceFlow(req, res));
  app.post("/api/flows/callback-hi", (req, res) => flowHandlers.handleCallbackFlow(req, res));
  app.post("/api/flows/trust-hi", (req, res) => flowHandlers.handleTrustFlow(req, res));
  app.post("/api/flows/eligibility-hi", (req, res) => flowHandlers.handleEligibilityFlow(req, res));

  // Diagnostic endpoint to test encryption key
  app.get("/api/crypto/test-key", async (req, res) => {
    try {
      const crypto = await import('crypto');
      const privateKeyEnv = process.env.WHATSAPP_FLOW_PRIVATE_KEY;
      
      if (!privateKeyEnv) {
        return res.status(500).json({ 
          error: "WHATSAPP_FLOW_PRIVATE_KEY not set",
          keyPresent: false
        });
      }

      // Format the private key properly
      // 1. Replace literal \n with actual newlines
      let formattedKey = privateKeyEnv.replace(/\\n/g, '\n');
      
      // 2. Fix single-line PEM (spaces instead of newlines between base64 chunks)
      if (formattedKey.startsWith('-----BEGIN PRIVATE KEY----- ')) {
        // Extract the parts
        const parts = formattedKey.split(' ');
        const header = parts.slice(0, 3).join(' '); // "-----BEGIN PRIVATE KEY-----"
        const footer = parts.slice(-3).join(' '); // "-----END PRIVATE KEY-----"
        const base64Lines = parts.slice(3, -3); // All the base64 chunks between header and footer
        
        // Reconstruct with proper newlines
        formattedKey = header + '\n' + base64Lines.join('\n') + '\n' + footer;
      }

      // If ?raw=1 is specified, output the raw key as plain text for copying to Render
      if (req.query.raw === '1') {
        res.setHeader('Content-Type', 'text/plain');
        return res.send(formattedKey);
      }
      
      // Test that we can create a private key object
      let keyObj;
      try {
        keyObj = crypto.createPrivateKey({
          key: formattedKey,
          format: 'pem'
        });
      } catch (e: any) {
        return res.status(500).json({
          error: "Failed to parse private key",
          keyLength: privateKeyEnv.length,
          formattedLength: formattedKey.length,
          startsCorrectly: formattedKey.startsWith('-----BEGIN'),
          endsCorrectly: formattedKey.endsWith('-----\n') || formattedKey.endsWith('-----'),
          parseError: e.message
        });
      }

      // Test encrypt/decrypt with OAEP label
      const testData = crypto.randomBytes(32);
      
      // Extract public key from private key properly
      const publicKeyObj = crypto.createPublicKey(keyObj);
      const publicKeyPem = publicKeyObj.export({ type: 'spki', format: 'pem' });
      
      const encrypted = crypto.publicEncrypt({
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        oaepLabel: Buffer.from('WA-FLOW-DATA')
      }, testData);

      const decrypted = crypto.privateDecrypt({
        key: formattedKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
        oaepLabel: Buffer.from('WA-FLOW-DATA')
      }, encrypted);

      const success = testData.equals(decrypted);

      res.json({
        success,
        keyPresent: true,
        keyLength: privateKeyEnv.length,
        formattedLength: formattedKey.length,
        hasProperFormat: formattedKey.includes('-----BEGIN') && formattedKey.includes('-----END'),
        encryptDecryptWorks: success,
        publicKeyFingerprint: crypto.createHash('sha256').update(publicKeyPem).digest('hex').substring(0, 16),
        expectedLength: 1704,
        actualLength: privateKeyEnv.length,
        lengthMatch: privateKeyEnv.length === 1704
      });
    } catch (error: any) {
      res.status(500).json({ 
        error: "Crypto test failed", 
        details: error.message,
        stack: error.stack
      });
    }
  });

  // QR Codes endpoints
  app.get("/api/qr-codes", async (req, res) => {
    try {
      const qrCodes = await storage.getQrCodes();
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ error: "Failed to fetch QR codes" });
    }
  });

  app.post("/api/qr-codes", async (req, res) => {
    try {
      const qrCode = await storage.createQrCode(req.body);
      res.json(qrCode);
    } catch (error) {
      console.error("Error creating QR code:", error);
      res.status(500).json({ error: "Failed to create QR code" });
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", async (req, res) => {
    try {
      const stats = await storage.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Contact Status Summary endpoint (for Status Page)
  app.get("/api/contact-status", async (req, res) => {
    try {
      const summary = await storage.getContactStatusSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching contact status:", error);
      res.status(500).json({ error: "Failed to fetch contact status" });
    }
  });

  // Get forms for a specific customer
  app.get("/api/contact-status/:customerPhone/forms", async (req, res) => {
    try {
      const forms = await storage.getForms(req.params.customerPhone);
      res.json(forms);
    } catch (error) {
      console.error("Error fetching forms:", error);
      res.status(500).json({ error: "Failed to fetch forms" });
    }
  });

  // CSV Export of contact status
  app.get("/api/contact-status/export/csv", async (req, res) => {
    try {
      const summary = await storage.getContactStatusSummary();
      
      // Helper function to escape CSV fields and prevent formula injection
      const escapeCsvField = (field: string | null): string => {
        if (!field) return '""';
        
        let value = String(field);
        
        // Prevent formula injection by checking for dangerous characters 
        // after trimming leading whitespace (Excel/Sheets may ignore leading whitespace)
        const trimmed = value.trimStart();
        if (/^[=+\-@]/.test(trimmed)) {
          value = "'" + value;
        }
        
        // Escape quotes by doubling them
        value = value.replace(/"/g, '""');
        
        // Always wrap in quotes for consistency and safety
        return `"${value}"`;
      };
      
      // Create CSV header
      const csvRows = ["Phone Number,Latest Event,Timestamp,Forms Submitted"];
      
      // Add data rows
      for (const contact of summary) {
        const timestamp = contact.latestEventTimestamp ? contact.latestEventTimestamp.toISOString() : '';
        const row = [
          escapeCsvField(contact.customerPhone),
          escapeCsvField(contact.latestEventType),
          escapeCsvField(timestamp),
          escapeCsvField(String(contact.formCount))
        ].join(',');
        csvRows.push(row);
      }
      
      const csv = csvRows.join('\n');
      
      // Add UTF-8 BOM for better Excel compatibility
      const csvWithBOM = '\uFEFF' + csv;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=contact-status.csv');
      res.send(csvWithBOM);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  // Clear all data endpoint
  app.post("/api/clear-data", async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ success: true, message: "All test data cleared" });
    } catch (error) {
      console.error("Error clearing data:", error);
      res.status(500).json({ error: "Failed to clear data" });
    }
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

  // Submit templates to Meta for approval
  app.post("/api/whatsapp/submit-templates", async (req, res) => {
    try {
      const result = await whatsappService.submitTemplates();
      res.json(result);
    } catch (error) {
      console.error("Error submitting templates:", error);
      res.status(500).json({ error: "Failed to submit templates" });
    }
  });

  // Customers API
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ error: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, validatedData);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(400).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const success = await storage.deleteCustomer(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ error: "Failed to delete customer" });
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

  // WhatsApp Flow Management API
  app.get("/api/whatsapp-flows", async (req, res) => {
    try {
      const flows = await storage.getWhatsappFlows();
      res.json(flows);
    } catch (error) {
      console.error("Error fetching WhatsApp flows:", error);
      res.status(500).json({ error: "Failed to fetch WhatsApp flows" });
    }
  });

  app.get("/api/whatsapp-flows/available", async (req, res) => {
    try {
      const flows = await storage.getWhatsappFlows();
      const availableFlows = flows.filter(f => f.status === 'published' && f.metaFlowId);
      res.json(availableFlows);
    } catch (error) {
      console.error("Error fetching available WhatsApp flows:", error);
      res.status(500).json({ error: "Failed to fetch available WhatsApp flows" });
    }
  });

  app.get("/api/whatsapp-flows/:flowKey", async (req, res) => {
    try {
      const flow = await storage.getWhatsappFlow(req.params.flowKey);
      if (!flow) {
        return res.status(404).json({ error: "WhatsApp flow not found" });
      }
      res.json(flow);
    } catch (error) {
      console.error("Error fetching WhatsApp flow:", error);
      res.status(500).json({ error: "Failed to fetch WhatsApp flow" });
    }
  });

  app.post("/api/whatsapp-flows/sync", async (req, res) => {
    try {
      const { flowManager } = await import("./whatsappFlowManager");
      const result = await flowManager.syncAllFlows();
      res.json(result);
    } catch (error) {
      console.error("Error syncing WhatsApp flows:", error);
      res.status(500).json({ 
        error: "Failed to sync WhatsApp flows", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.get("/api/whatsapp-flows/status/summary", async (req, res) => {
    try {
      const { flowManager } = await import("./whatsappFlowManager");
      const summary = await flowManager.getFlowStatusSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching flow status summary:", error);
      res.status(500).json({ error: "Failed to fetch flow status summary" });
    }
  });

  app.post("/api/whatsapp-flows/:flowKey/publish", async (req, res) => {
    try {
      const { flowManager } = await import("./whatsappFlowManager");
      const flow = await storage.getWhatsappFlow(req.params.flowKey);
      
      if (!flow) {
        return res.status(404).json({ error: "WhatsApp flow not found" });
      }
      
      if (!flow.metaFlowId) {
        return res.status(400).json({ error: "Flow has not been created in WhatsApp yet. Run sync first." });
      }
      
      const result = await flowManager.publishFlow(flow.metaFlowId);
      
      if (result.success) {
        await storage.updateWhatsappFlow(req.params.flowKey, {
          status: "published",
          lastSyncedAt: new Date()
        });
        res.json({ success: true, message: "Flow published successfully" });
      } else {
        res.status(500).json({ error: result.error || "Failed to publish flow" });
      }
    } catch (error) {
      console.error("Error publishing WhatsApp flow:", error);
      res.status(500).json({ error: "Failed to publish WhatsApp flow" });
    }
  });

  app.delete("/api/whatsapp-flows/:flowKey", async (req, res) => {
    try {
      const { flowManager } = await import("./whatsappFlowManager");
      const flow = await storage.getWhatsappFlow(req.params.flowKey);
      
      if (!flow) {
        return res.status(404).json({ error: "WhatsApp flow not found" });
      }
      
      // If flow exists in WhatsApp, delete or deprecate it
      if (flow.metaFlowId) {
        if (flow.status === "published") {
          // Deprecate published flows (can't delete them)
          await flowManager.deprecateFlow(flow.metaFlowId);
        } else {
          // Delete draft flows
          await flowManager.deleteFlow(flow.metaFlowId);
        }
      }
      
      // Delete from database
      const success = await storage.deleteWhatsappFlow(req.params.flowKey);
      if (success) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "WhatsApp flow not found" });
      }
    } catch (error) {
      console.error("Error deleting WhatsApp flow:", error);
      res.status(500).json({ error: "Failed to delete WhatsApp flow" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
