import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { type MessageTemplate } from "@shared/schema";
import { allMetaTemplates, type MetaTemplate } from "./metaTemplates";

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  verifyToken: string;
  appSecret: string;
  wabaId: string;
  appId: string;
}

interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface UploadMediaResponse {
  success: boolean;
  mediaId?: string;
  error?: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl = "https://graph.facebook.com/v21.0";

  constructor() {
    this.config = {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "",
      appSecret: process.env.WHATSAPP_APP_SECRET || "",
      wabaId: process.env.WHATSAPP_WABA_ID || "",
      appId: process.env.WHATSAPP_APP_ID || "",
    };
  }

  isConfigured(): boolean {
    return !!(this.config.phoneNumberId && this.config.accessToken);
  }

  async uploadMedia(filePath: string, mimeType: string): Promise<UploadMediaResponse> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: "WhatsApp not configured" };
      }

      const formData = new FormData();
      formData.append("messaging_product", "whatsapp");
      formData.append("file", fs.createReadStream(filePath), {
        contentType: mimeType,
        filename: path.basename(filePath),
      });

      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            ...formData.getHeaders(),
          },
        }
      );

      return {
        success: true,
        mediaId: response.data.id,
      };
    } catch (error: any) {
      console.error("Error uploading media to WhatsApp:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async uploadTemplateMedia(filePath: string, mimeType: string): Promise<UploadMediaResponse> {
    try {
      if (!this.isConfigured() || !this.config.appId) {
        return { success: false, error: "WhatsApp App ID not configured. Please set WHATSAPP_APP_ID environment variable." };
      }

      // Step 1: Create upload session
      const fileStats = fs.statSync(filePath);
      const fileSize = fileStats.size;
      const fileName = path.basename(filePath);

      console.log(`Creating upload session for ${fileName} (${fileSize} bytes)...`);
      
      const sessionResponse = await axios.post(
        `${this.baseUrl}/${this.config.appId}/uploads`,
        null,
        {
          params: {
            file_name: fileName,
            file_length: fileSize,
            file_type: mimeType,
          },
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
          },
        }
      );

      const sessionId = sessionResponse.data.id;
      console.log(`Upload session created: ${sessionId}`);

      // Step 2: Upload binary file data
      console.log("Uploading file binary data...");
      const fileBuffer = fs.readFileSync(filePath);

      const uploadResponse = await axios.post(
        `${this.baseUrl}/${sessionId}`,
        fileBuffer,
        {
          headers: {
            Authorization: `OAuth ${this.config.accessToken}`,
            "Content-Type": "application/octet-stream",
            file_offset: "0",
          },
        }
      );

      const fileHandle = uploadResponse.data.h;
      console.log(`File uploaded successfully. Handle: ${fileHandle}`);

      return {
        success: true,
        mediaId: fileHandle,
      };
    } catch (error: any) {
      console.error("Error uploading template media to WhatsApp:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async sendTextMessage(to: string, text: string): Promise<SendMessageResponse> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: "WhatsApp not configured" };
      }

      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error("Error sending WhatsApp text message:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async sendButtonMessage(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    headerText?: string,
    footerText?: string,
    headerImageMediaId?: string
  ): Promise<SendMessageResponse> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: "WhatsApp not configured" };
      }

      const buttonComponents = buttons.map((btn) => ({
        type: "reply",
        reply: {
          id: btn.id,
          title: btn.title.substring(0, 20),
        },
      }));

      const interactive: any = {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttonComponents,
        },
      };

      if (headerImageMediaId) {
        interactive.header = { type: "image", image: { id: headerImageMediaId } };
      } else if (headerText) {
        interactive.header = { type: "text", text: headerText };
      }

      if (footerText) {
        interactive.footer = { text: footerText };
      }

      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "interactive",
          interactive,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error("Error sending WhatsApp button message:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async sendListMessage(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string; nextStep?: string }>;
    }>,
    headerText?: string,
    footerText?: string,
    headerImageMediaId?: string
  ): Promise<SendMessageResponse> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: "WhatsApp not configured" };
      }

      const interactive: any = {
        type: "list",
        body: { text: bodyText },
        action: {
          button: buttonText.substring(0, 20),
          sections: sections.map((section) => ({
            title: section.title,
            rows: section.rows.map((row) => ({
              id: row.id,
              title: row.title.substring(0, 24),
              description: row.description?.substring(0, 72),
            })),
          })),
        },
      };

      if (headerImageMediaId) {
        interactive.header = { type: "image", image: { id: headerImageMediaId } };
      } else if (headerText) {
        interactive.header = { type: "text", text: headerText };
      }

      if (footerText) {
        interactive.footer = { text: footerText };
      }

      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "interactive",
          interactive,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error("Error sending WhatsApp list message:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async sendFlowMessage(
    to: string,
    flowId: string,
    bodyText: string,
    buttonText: string,
    flowToken: string,
    headerText?: string,
    footerText?: string,
    flowActionPayload?: Record<string, any>
  ): Promise<SendMessageResponse> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: "WhatsApp not configured" };
      }

      const parameters: any = {
        flow_message_version: "3",
        flow_token: flowToken,
        flow_id: flowId,
        flow_cta: buttonText.substring(0, 20),
        flow_action: "navigate"
      };

      if (flowActionPayload) {
        parameters.flow_action_payload = flowActionPayload;
      }

      const interactive: any = {
        type: "flow",
        body: { text: bodyText },
        action: {
          name: "flow",
          parameters
        }
      };

      if (headerText) {
        interactive.header = { type: "text", text: headerText };
      }

      if (footerText) {
        interactive.footer = { text: footerText };
      }

      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "interactive",
          interactive,
        },
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error("Error sending WhatsApp flow message:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async sendApprovedTemplateMessage(
    to: string,
    templateName: string,
    languageCode: string = "en_US",
    components?: Array<any>
  ): Promise<SendMessageResponse> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: "WhatsApp not configured" };
      }

      const payload: any = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      };

      if (components && components.length > 0) {
        payload.template.components = components;
      }

      const response = await axios.post(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
      };
    } catch (error: any) {
      console.error("Error sending WhatsApp approved template message:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async sendTemplateMessage(to: string, template: MessageTemplate): Promise<SendMessageResponse> {
    // Check if this is a Meta-approved template that should be sent via Template API
    if (template.metaStatus === "approved" && template.name) {
      // This is a Meta-approved template - use Template Messages API
      // Map template language to WhatsApp language code
      const languageCode = template.language === "hi" ? "hi" : "en_US";
      
      // Build components array for template
      const components: Array<any> = [];
      
      // Add header component ONLY for image headers (media headers always need parameters)
      // Static text headers in approved templates should NOT have parameters
      if (template.headerMediaId) {
        components.push({
          type: "header",
          parameters: [
            {
              type: "image",
              image: {
                id: template.headerMediaId,
              },
            },
          ],
        });
      }
      
      return this.sendApprovedTemplateMessage(
        to,
        template.name,
        languageCode,
        components.length > 0 ? components : undefined
      );
    }
    
    // Otherwise, send as interactive message
    if (template.messageType === "button" && template.buttons) {
      const buttons = template.buttons as Array<{ id: string; title: string }>;
      return this.sendButtonMessage(
        to,
        template.bodyText,
        buttons,
        template.headerText || undefined,
        template.footerText || undefined,
        template.headerMediaId || undefined
      );
    } else if (template.messageType === "list" && template.listSections) {
      const sections = template.listSections as Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string; nextStep?: string }>;
      }>;
      const buttonText = template.footerText || "Options";
      return this.sendListMessage(
        to,
        template.bodyText,
        buttonText,
        sections,
        template.headerText || undefined,
        undefined,
        template.headerMediaId || undefined
      );
    } else {
      return this.sendTextMessage(to, template.bodyText);
    }
  }

  generateFlowToken(customerPhone: string): string {
    const payload = {
      phone: customerPhone,
      timestamp: Date.now(),
    };
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    return payloadBase64;
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === "subscribe" && token === this.config.verifyToken) {
      return challenge;
    }
    return null;
  }

  verifyWebhookSignature(signature: string, body: string): boolean {
    if (!this.config.appSecret) {
      console.error("WHATSAPP_APP_SECRET not configured - webhook signature verification disabled");
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.config.appSecret)
        .update(body)
        .digest("hex");

      return `sha256=${expectedSignature}` === signature;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return false;
    }
  }

  parseIncomingMessage(webhookData: any): {
    customerPhone: string;
    customerName?: string;
    messageType: "text" | "button" | "list";
    content: string;
    selectedButtonId?: string;
    selectedListItemId?: string;
  } | null {
    try {
      const entry = webhookData.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (!message) return null;

      const customerPhone = message.from;
      const customerName = value?.contacts?.[0]?.profile?.name;

      if (message.type === "text") {
        return {
          customerPhone,
          customerName,
          messageType: "text",
          content: message.text.body,
        };
      } else if (message.type === "button") {
        const buttonText = message.button.text;
        const buttonPayload = message.button.payload || buttonText;
        
        const buttonMapping: Record<string, string> = {
          "हिंदी": "hindi",
          "English": "english",
          "Book Site Survey": "site_survey",
          "Book site survey": "site_survey",
          "Price Estimate": "price_estimate",
          "Service & Support": "help",
          "साइट सर्वे बुक करें": "site_survey",
          "मूल्य अनुमान": "price_estimate",
          "सेवा और सहायता": "help",
          "Request callback": "callback",
          "कॉलबैक का अनुरोध": "callback",
          "Other help": "other_issue",
          "अन्य सहायता": "other_issue",
          "Maintenance request": "maintenance",
          "रखरखाव अनुरोध": "maintenance",
          "Register issue": "other_issue",
          "समस्या दर्ज करें": "other_issue",
          "Low": "low",
          "कम": "low",
          "Medium": "medium",
          "मध्यम": "medium",
          "High": "high",
          "उच्च": "high",
        };
        
        const normalizedId = buttonMapping[buttonText] || buttonPayload.toLowerCase().replace(/[^a-z0-9_]/g, "_");
        
        return {
          customerPhone,
          customerName,
          messageType: "button",
          content: buttonText,
          selectedButtonId: normalizedId,
        };
      } else if (message.type === "interactive") {
        if (message.interactive.type === "button_reply") {
          return {
            customerPhone,
            customerName,
            messageType: "button",
            content: message.interactive.button_reply.title,
            selectedButtonId: message.interactive.button_reply.id,
          };
        } else if (message.interactive.type === "list_reply") {
          return {
            customerPhone,
            customerName,
            messageType: "list",
            content: message.interactive.list_reply.title,
            selectedListItemId: message.interactive.list_reply.id,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error parsing incoming WhatsApp message:", error);
      return null;
    }
  }

  parseStatusUpdate(webhookData: any): {
    messageId: string;
    recipientPhone: string;
    status: "delivered" | "read" | "failed";
    timestamp: number;
    errorCode?: string;
    errorMessage?: string;
  } | null {
    try {
      const entry = webhookData.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const status = value?.statuses?.[0];

      if (!status) return null;

      const result: any = {
        messageId: status.id,
        recipientPhone: status.recipient_id,
        status: status.status,
        timestamp: status.timestamp,
      };

      // If message failed, capture error details
      if (status.status === "failed" && status.errors?.[0]) {
        const error = status.errors[0];
        result.errorCode = error.code;
        result.errorMessage = error.title || error.message;
        
        // Log detailed error for debugging
        console.error(`WhatsApp message delivery failed:`, {
          messageId: status.id,
          recipient: status.recipient_id,
          errorCode: error.code,
          errorMessage: error.title || error.message,
          errorDetails: error.error_data
        });
      }

      return result;
    } catch (error) {
      console.error("Error parsing WhatsApp status update:", error);
      return null;
    }
  }

  async submitTemplates(): Promise<{
    success: boolean;
    results: Array<{
      name: string;
      status: "success" | "error";
      id?: string;
      error?: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    const wabaId = process.env.WHATSAPP_WABA_ID;
    
    if (!wabaId) {
      throw new Error("WHATSAPP_WABA_ID is not configured. Please add it to your environment secrets.");
    }

    if (!this.config.accessToken) {
      throw new Error("WHATSAPP_ACCESS_TOKEN is not configured. Please add it to your environment secrets.");
    }

    const results: Array<{
      name: string;
      status: "success" | "error";
      id?: string;
      error?: string;
    }> = [];

    console.log(`Starting template submission to Meta (WABA ID: ${wabaId})...`);
    console.log(`Total templates to submit: ${allMetaTemplates.length}`);

    for (const template of allMetaTemplates) {
      try {
        console.log(`Submitting template: ${template.name} (${template.category} - ${template.language})`);
        
        const response = await axios.post(
          `https://graph.facebook.com/v21.0/${wabaId}/message_templates`,
          template,
          {
            headers: {
              Authorization: `Bearer ${this.config.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        results.push({
          name: template.name,
          status: "success",
          id: response.data.id,
        });

        console.log(`✅ Successfully submitted: ${template.name} (ID: ${response.data.id})`);
      } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || error.message;
        const errorCode = error.response?.data?.error?.code;
        
        results.push({
          name: template.name,
          status: "error",
          error: `${errorCode ? `[${errorCode}] ` : ""}${errorMessage}`,
        });

        console.error(`❌ Failed to submit ${template.name}: ${errorMessage}`);
      }

      // Add a small delay between submissions to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const successful = results.filter(r => r.status === "success").length;
    const failed = results.filter(r => r.status === "error").length;

    console.log(`\nTemplate submission complete:`);
    console.log(`  Total: ${allMetaTemplates.length}`);
    console.log(`  Successful: ${successful}`);
    console.log(`  Failed: ${failed}`);

    return {
      success: failed === 0,
      results,
      summary: {
        total: allMetaTemplates.length,
        successful,
        failed,
      },
    };
  }

  async submitSingleTemplate(template: MetaTemplate): Promise<{
    success: boolean;
    id?: string;
    error?: string;
    status?: string;
    alreadyExists?: boolean;
  }> {
    const wabaId = process.env.WHATSAPP_WABA_ID;
    
    if (!wabaId) {
      return {
        success: false,
        error: "WHATSAPP_WABA_ID is not configured. Please add it to your environment secrets.",
      };
    }

    if (!this.config.accessToken) {
      return {
        success: false,
        error: "WHATSAPP_ACCESS_TOKEN is not configured. Please add it to your environment secrets.",
      };
    }

    try {
      console.log(`Submitting template: ${template.name} (${template.category} - ${template.language})`);
      console.log("Full template payload:", JSON.stringify(template, null, 2));
      
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${wabaId}/message_templates`,
        template,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`✅ Successfully submitted: ${template.name} (ID: ${response.data.id})`);
      return {
        success: true,
        id: response.data.id,
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      const errorCode = error.response?.data?.error?.code;
      const errorSubcode = error.response?.data?.error?.error_subcode;
      const errorDetails = error.response?.data?.error?.error_data || error.response?.data?.error || {};
      
      console.error(`❌ Failed to submit ${template.name}: ${errorMessage}`);
      console.error("Full error response:", JSON.stringify(error.response?.data, null, 2));
      console.error("Error details:", JSON.stringify(errorDetails, null, 2));
      
      // Handle specific error: Template language being deleted (error_subcode 2388023)
      if (errorSubcode === 2388023) {
        const userMessage = error.response?.data?.error?.error_user_msg || errorMessage;
        console.error(`Template ${template.name} language is being deleted: ${userMessage}`);
        return {
          success: false,
          error: `Meta is currently deleting this template language. ${userMessage}`,
        };
      }
      
      // Handle specific error: Template already exists (error_subcode 2388024)
      if (errorSubcode === 2388024) {
        console.log(`Template ${template.name} already exists in Meta. Syncing status...`);
        const syncResult = await this.syncTemplateStatus(template.name);
        
        if (syncResult.success && syncResult.status && syncResult.id) {
          console.log(`✅ Template ${template.name} found in Meta with status: ${syncResult.status}`);
          return {
            success: true,
            id: syncResult.id,
            status: syncResult.status,
            alreadyExists: true,
          };
        } else {
          // Sync failed, return error
          console.error(`Failed to sync status for existing template ${template.name}: ${syncResult.error}`);
          return {
            success: false,
            error: `Template already exists in Meta, but failed to sync status. Please try using the "Sync Status" button to get the current template status.`,
          };
        }
      }
      
      return {
        success: false,
        error: `${errorCode ? `[${errorCode}] ` : ""}${errorMessage}`,
      };
    }
  }

  async syncTemplateStatus(templateName: string): Promise<{
    success: boolean;
    status?: string;
    id?: string;
    error?: string;
    statusCode?: number;
  }> {
    const wabaId = process.env.WHATSAPP_WABA_ID;
    
    if (!wabaId) {
      return {
        success: false,
        error: "WHATSAPP_WABA_ID is not configured",
      };
    }

    if (!this.config.accessToken) {
      return {
        success: false,
        error: "WHATSAPP_ACCESS_TOKEN is not configured",
      };
    }

    try {
      // Fetch template status from Meta
      const response = await axios.get(
        `https://graph.facebook.com/v21.0/${wabaId}/message_templates`,
        {
          params: {
            name: templateName,
          },
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
          },
        }
      );

      const templates = response.data.data;
      if (templates && templates.length > 0) {
        // Find exact match (case-sensitive) - Meta API may return multiple locales
        const exactMatch = templates.find((t: any) => t.name === templateName);
        
        if (exactMatch) {
          return {
            success: true,
            status: exactMatch.status,
            id: exactMatch.id,
          };
        } else {
          // Name doesn't match exactly - this shouldn't happen but handle it
          console.warn(`Template name mismatch: requested "${templateName}", got "${templates[0].name}"`);
          return {
            success: false,
            error: "Template not found on Meta",
          };
        }
      } else {
        return {
          success: false,
          error: "Template not found on Meta",
          statusCode: 404,
        };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      const statusCode = error.response?.status || 500;
      console.error(`Error syncing template status for ${templateName}: ${errorMessage} (Status: ${statusCode})`);
      return {
        success: false,
        error: errorMessage,
        statusCode,
      };
    }
  }
}

export const whatsappService = new WhatsAppService();
