import type { Request, Response } from "express";
import type { IStorage } from "./storage";
import { insertLeadSchema, insertServiceRequestSchema, insertPriceEstimateSchema, insertCallbackRequestSchema, insertFormSchema, insertEventSchema } from "@shared/schema";
import { z } from "zod";

interface FlowDataExchangeRequest {
  version: string;
  action: "PING" | "INIT" | "DATA_EXCHANGE";
  screen: string;
  data: Record<string, any>;
  flow_token: string;
}

interface FlowDataExchangeResponse {
  version: string;
  screen: string;
  data?: Record<string, any>;
}

export class FlowHandlers {
  constructor(private storage: IStorage) {}

  private parseIntOrUndefined(value: any): number | undefined {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }
    const num = parseInt(String(value), 10);
    return Number.isNaN(num) ? undefined : num;
  }

  private validatePhone(phone: string): boolean {
    if (!phone || phone === "unknown") {
      return false;
    }
    const e164Pattern = /^\+?[1-9]\d{1,14}$/;
    return e164Pattern.test(phone);
  }

  async handleSurveyFlow(req: Request, res: Response) {
    try {
      const body: FlowDataExchangeRequest = req.body;
      const decryptedData = this.decryptFlowData(body);
      
      const action = decryptedData.action?.toUpperCase() as "PING" | "INIT" | "DATA_EXCHANGE";

      if (action === "PING") {
        return res.json({
          version: "3.0",
          data: { status: "active" }
        });
      }

      if (action === "INIT") {
        return res.json({
          version: "3.0",
          screen: "SURVEY_FORM",
          data: {}
        });
      }

      if (action === "DATA_EXCHANGE") {
        if (decryptedData.version !== "3.0") {
          return res.status(400).json({ error: "Unsupported version" });
        }

        const formData = decryptedData.data;
        const customerPhone = this.extractPhoneFromFlowToken(decryptedData.flow_token);
        
        if (!this.validatePhone(customerPhone)) {
          return res.status(400).json({ 
            error: "Invalid phone number format" 
          });
        }
        
        const leadData = {
          customerName: formData.name,
          customerPhone: customerPhone,
          address: formData.address,
          village: formData.village,
          interestedIn: formData.interested_in,
          avgBill: this.parseIntOrUndefined(formData.avg_bill),
          phase: formData.phase,
          roofType: formData.roof_type,
          preferredSurveyDate: formData.preferred_date,
          preferredSurveyTime: formData.preferred_time,
          notes: formData.notes,
        };

        const validatedLead = insertLeadSchema.parse(leadData);
        await this.storage.createLead(validatedLead);

        const validatedForm = insertFormSchema.parse({
          customerPhone,
          formType: "site_survey",
          data: formData,
        });
        await this.storage.createForm(validatedForm);

        const validatedEvent = insertEventSchema.parse({
          customerPhone,
          type: "form_submitted_site_survey",
          meta: { flowType: "survey" },
        });
        await this.storage.createEvent(validatedEvent);

        const response: FlowDataExchangeResponse = {
          version: "3.0",
          screen: "SUCCESS",
          data: {
            extension_message_response: {
              params: {
                flow_token: decryptedData.flow_token,
              }
            }
          }
        };

        return res.json(response);
      }

      return res.status(400).json({ error: "Invalid action" });
    } catch (error) {
      console.error("Survey flow error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to process survey flow" });
    }
  }

  async handlePriceFlow(req: Request, res: Response) {
    try {
      const body: FlowDataExchangeRequest = req.body;
      const decryptedData = this.decryptFlowData(body);
      
      const action = decryptedData.action?.toUpperCase() as "PING" | "INIT" | "DATA_EXCHANGE";

      if (action === "PING") {
        return res.json({
          version: "3.0",
          data: { status: "active" }
        });
      }

      if (action === "INIT") {
        return res.json({
          version: "3.0",
          screen: "PRICE_FORM",
          data: {}
        });
      }

      if (action === "DATA_EXCHANGE") {
        if (decryptedData.version !== "3.0") {
          return res.status(400).json({ error: "Unsupported version" });
        }

        const formData = decryptedData.data;
        const customerPhone = this.extractPhoneFromFlowToken(decryptedData.flow_token);
        
        if (!this.validatePhone(customerPhone)) {
          return res.status(400).json({ 
            error: "Invalid phone number format" 
          });
        }
        
        const priceData = {
          customerName: formData.name,
          customerPhone: customerPhone,
          address: formData.address,
          village: formData.village,
          avgBill: this.parseIntOrUndefined(formData.avg_bill),
          monthlyUnits: this.parseIntOrUndefined(formData.monthly_units),
          phase: formData.phase,
          roofType: formData.roof_type,
          notes: formData.notes,
        };

        const validatedPrice = insertPriceEstimateSchema.parse(priceData);
        await this.storage.createPriceEstimate(validatedPrice);

        const validatedForm = insertFormSchema.parse({
          customerPhone,
          formType: "price_estimate",
          data: formData,
        });
        await this.storage.createForm(validatedForm);

        const validatedEvent = insertEventSchema.parse({
          customerPhone,
          type: "form_submitted_price_estimate",
          meta: { flowType: "price" },
        });
        await this.storage.createEvent(validatedEvent);

        const response: FlowDataExchangeResponse = {
          version: "3.0",
          screen: "SUCCESS",
          data: {
            extension_message_response: {
              params: {
                flow_token: decryptedData.flow_token,
              }
            }
          }
        };

        return res.json(response);
      }

      return res.status(400).json({ error: "Invalid action" });
    } catch (error) {
      console.error("Price flow error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to process price flow" });
    }
  }

  async handleServiceFlow(req: Request, res: Response) {
    try {
      const body: FlowDataExchangeRequest = req.body;
      const decryptedData = this.decryptFlowData(body);
      
      const action = decryptedData.action?.toUpperCase() as "PING" | "INIT" | "DATA_EXCHANGE";

      if (action === "PING") {
        return res.json({
          version: "3.0",
          data: { status: "active" }
        });
      }

      if (action === "INIT") {
        return res.json({
          version: "3.0",
          screen: "SERVICE_FORM",
          data: {}
        });
      }

      if (action === "DATA_EXCHANGE") {
        if (decryptedData.version !== "3.0") {
          return res.status(400).json({ error: "Unsupported version" });
        }

        const formData = decryptedData.data;
        const customerPhone = this.extractPhoneFromFlowToken(decryptedData.flow_token);
        
        if (!this.validatePhone(customerPhone)) {
          return res.status(400).json({ 
            error: "Invalid phone number format" 
          });
        }
        
        const serviceData = {
          customerName: formData.name,
          customerPhone: customerPhone,
          address: formData.address,
          customerVillage: formData.village,
          issueType: formData.issue_type,
          description: formData.description,
          urgency: formData.urgency,
          preferredDate: formData.preferred_date,
          preferredTime: formData.preferred_time,
        };

        const validatedService = insertServiceRequestSchema.parse(serviceData);
        await this.storage.createServiceRequest(validatedService);

        const validatedForm = insertFormSchema.parse({
          customerPhone,
          formType: "service_request",
          data: formData,
        });
        await this.storage.createForm(validatedForm);

        const validatedEvent = insertEventSchema.parse({
          customerPhone,
          type: "form_submitted_service_request",
          meta: { flowType: "service" },
        });
        await this.storage.createEvent(validatedEvent);

        const response: FlowDataExchangeResponse = {
          version: "3.0",
          screen: "SUCCESS",
          data: {
            extension_message_response: {
              params: {
                flow_token: decryptedData.flow_token,
              }
            }
          }
        };

        return res.json(response);
      }

      return res.status(400).json({ error: "Invalid action" });
    } catch (error) {
      console.error("Service flow error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to process service flow" });
    }
  }

  async handleCallbackFlow(req: Request, res: Response) {
    try {
      const body: FlowDataExchangeRequest = req.body;
      const decryptedData = this.decryptFlowData(body);
      
      const action = decryptedData.action?.toUpperCase() as "PING" | "INIT" | "DATA_EXCHANGE";

      if (action === "PING") {
        return res.json({
          version: "3.0",
          data: { status: "active" }
        });
      }

      if (action === "INIT") {
        return res.json({
          version: "3.0",
          screen: "CALLBACK_FORM",
          data: {}
        });
      }

      if (action === "DATA_EXCHANGE") {
        if (decryptedData.version !== "3.0") {
          return res.status(400).json({ error: "Unsupported version" });
        }

        const formData = decryptedData.data;
        const customerPhone = this.extractPhoneFromFlowToken(decryptedData.flow_token);
        
        if (!this.validatePhone(customerPhone)) {
          return res.status(400).json({ 
            error: "Invalid phone number format" 
          });
        }
        
        const callbackData = {
          customerName: formData.name,
          customerPhone: customerPhone,
          bestTime: formData.best_time,
          topic: formData.topic,
          notes: formData.notes,
          source: "flow_request",
        };

        const validatedCallback = insertCallbackRequestSchema.parse(callbackData);
        await this.storage.createCallbackRequest(validatedCallback);

        const validatedForm = insertFormSchema.parse({
          customerPhone,
          formType: "callback",
          data: formData,
        });
        await this.storage.createForm(validatedForm);

        const validatedEvent = insertEventSchema.parse({
          customerPhone,
          type: "form_submitted_callback",
          meta: { flowType: "callback" },
        });
        await this.storage.createEvent(validatedEvent);

        const response: FlowDataExchangeResponse = {
          version: "3.0",
          screen: "SUCCESS",
          data: {
            extension_message_response: {
              params: {
                flow_token: decryptedData.flow_token,
              }
            }
          }
        };

        return res.json(response);
      }

      return res.status(400).json({ error: "Invalid action" });
    } catch (error) {
      console.error("Callback flow error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      return res.status(500).json({ error: "Failed to process callback flow" });
    }
  }

  private decryptFlowData(body: FlowDataExchangeRequest): FlowDataExchangeRequest {
    // TODO: Implement proper signature verification for WhatsApp Flow data_exchange
    // For now, this is a pass-through, but in production this MUST verify Meta's signature
    return body;
  }

  private extractPhoneFromFlowToken(flowToken: string): string {
    try {
      const decoded = Buffer.from(flowToken, 'base64').toString('utf-8');
      const data = JSON.parse(decoded);
      return data.phone || "unknown";
    } catch (error) {
      console.error("Failed to extract phone from flow token:", error);
      return "unknown";
    }
  }
}
