import { whatsappService } from "./whatsapp";
import { storage } from "./storage";
import { type Lead, type ServiceRequest } from "@shared/schema";

export class NotificationService {
  async sendLeadNotification(lead: Lead, action: "created" | "updated"): Promise<void> {
    try {
      if (!whatsappService.isConfigured()) {
        console.log("WhatsApp not configured, skipping notification");
        return;
      }

      let messageText = "";
      
      if (action === "created") {
        messageText = `Thank you for your interest in solar installation! We have received your request for ${lead.interestedIn}. `;
        
        if (lead.preferredSurveyDate && lead.preferredSurveyTime) {
          messageText += `Our team will visit you on ${lead.preferredSurveyDate} at ${lead.preferredSurveyTime} for a site survey. `;
        } else {
          messageText += `Our team will contact you soon to schedule a site survey. `;
        }
        
        messageText += `We will keep you updated on the progress. - Sunshine Power`;
      } else {
        messageText = `Update on your solar installation request: `;
        
        if (lead.preferredSurveyDate && lead.preferredSurveyTime) {
          messageText += `Your site survey is scheduled for ${lead.preferredSurveyDate} at ${lead.preferredSurveyTime}. `;
        }
        
        if (lead.notes) {
          messageText += `${lead.notes} `;
        }
        
        messageText += `Thank you for choosing Sunshine Power!`;
      }

      const result = await whatsappService.sendTextMessage(
        lead.customerPhone,
        messageText
      );

      await storage.createWhatsappLog({
        customerPhone: lead.customerPhone,
        direction: "outbound",
        messageType: "text",
        content: { text: messageText, leadId: lead.id, action },
        status: result.success ? "sent" : "failed",
      });

      if (!result.success) {
        console.error(`Failed to send lead notification: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending lead notification:", error);
    }
  }

  async sendServiceRequestNotification(request: ServiceRequest, action: "created" | "updated"): Promise<void> {
    try {
      if (!whatsappService.isConfigured()) {
        console.log("WhatsApp not configured, skipping notification");
        return;
      }

      let messageText = "";
      
      if (action === "created") {
        messageText = `Thank you for contacting Sunshine Power! We have received your service request regarding "${request.issueType}". `;
        
        const urgencyMap: Record<string, string> = {
          high: "urgent",
          medium: "within 2-3 days",
          low: "within a week",
        };
        
        const timeframe = urgencyMap[request.urgency.toLowerCase()] || "soon";
        messageText += `We will address this ${timeframe}. `;
        
        if (request.assignedTo) {
          messageText += `Technician ${request.assignedTo} has been assigned to your case. `;
        }
        
        messageText += `We appreciate your patience!`;
      } else {
        messageText = `Update on your service request (#${request.id.slice(0, 8)}): `;
        
        const statusMap: Record<string, string> = {
          pending: "is being reviewed by our team",
          assigned: "has been assigned to a technician",
          "in-progress": "is currently being worked on",
          completed: "has been completed",
          cancelled: "has been cancelled",
        };
        
        const statusText = statusMap[request.status] || `status updated to ${request.status}`;
        messageText += `Your request ${statusText}. `;
        
        if (request.assignedTo && action === "updated") {
          messageText += `Technician: ${request.assignedTo}. `;
        }
        
        if (request.status === "completed") {
          messageText += `Thank you for choosing Sunshine Power! If you need further assistance, please let us know.`;
        } else {
          messageText += `We will keep you informed. - Sunshine Power`;
        }
      }

      const result = await whatsappService.sendTextMessage(
        request.customerPhone,
        messageText
      );

      await storage.createWhatsappLog({
        customerPhone: request.customerPhone,
        direction: "outbound",
        messageType: "text",
        content: { text: messageText, serviceRequestId: request.id, action, status: request.status },
        status: result.success ? "sent" : "failed",
      });

      if (!result.success) {
        console.error(`Failed to send service request notification: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending service request notification:", error);
    }
  }
}

export const notificationService = new NotificationService();
