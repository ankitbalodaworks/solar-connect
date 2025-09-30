import axios from "axios";
import { type MessageTemplate } from "@shared/schema";

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  verifyToken: string;
}

interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class WhatsAppService {
  private config: WhatsAppConfig;
  private baseUrl = "https://graph.facebook.com/v18.0";

  constructor() {
    this.config = {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "",
    };
  }

  isConfigured(): boolean {
    return !!(this.config.phoneNumberId && this.config.accessToken);
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
    footerText?: string
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
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    headerText?: string,
    footerText?: string
  ): Promise<SendMessageResponse> {
    try {
      if (!this.isConfigured()) {
        return { success: false, error: "WhatsApp not configured" };
      }

      const interactive: any = {
        type: "list",
        body: { text: bodyText },
        action: {
          button: buttonText,
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
      console.error("Error sending WhatsApp list message:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  async sendTemplateMessage(to: string, template: MessageTemplate): Promise<SendMessageResponse> {
    if (template.messageType === "button" && template.buttons) {
      const buttons = template.buttons as Array<{ id: string; title: string }>;
      return this.sendButtonMessage(
        to,
        template.bodyText,
        buttons,
        template.headerText || undefined,
        template.footerText || undefined
      );
    } else if (template.messageType === "list" && template.listSections) {
      const sections = template.listSections as Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
      }>;
      return this.sendListMessage(
        to,
        template.bodyText,
        "Select an option",
        sections,
        template.headerText || undefined,
        template.footerText || undefined
      );
    } else {
      return this.sendTextMessage(to, template.bodyText);
    }
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === "subscribe" && token === this.config.verifyToken) {
      return challenge;
    }
    return null;
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
}

export const whatsappService = new WhatsAppService();
