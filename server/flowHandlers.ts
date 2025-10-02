import type { Request, Response } from "express";
import type { IStorage } from "./storage";
import { insertLeadSchema, insertServiceRequestSchema, insertPriceEstimateSchema, insertCallbackRequestSchema, insertFormSchema, insertEventSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

interface FlowDataExchangeRequest {
  version: string;
  action: "PING" | "INIT" | "DATA_EXCHANGE";
  screen: string;
  data: Record<string, any>;
  flow_token: string;
}

interface EncryptedFlowRequest {
  encrypted_flow_data: string;
  encrypted_aes_key: string;
  initial_vector: string;
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
      const aesKey = (decryptedData as any)._aesKey;
      const initialVector = (decryptedData as any)._initialVector;

      if (action === "PING") {
        const response = {
          version: "3.0",
          data: { status: "active" }
        };
        
        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
        return res.json(response);
      }

      if (action === "INIT") {
        const response = {
          version: "3.0",
          screen: "SURVEY_FORM",
          data: {}
        };
        
        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
        return res.json(response);
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

        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
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
      const aesKey = (decryptedData as any)._aesKey;
      const initialVector = (decryptedData as any)._initialVector;

      if (action === "PING") {
        const response = {
          version: "3.0",
          data: { status: "active" }
        };
        
        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
        return res.json(response);
      }

      if (action === "INIT") {
        const response = {
          version: "3.0",
          screen: "PRICE_FORM",
          data: {}
        };
        
        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
        return res.json(response);
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

        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
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
      const aesKey = (decryptedData as any)._aesKey;
      const initialVector = (decryptedData as any)._initialVector;

      if (action === "PING") {
        const response = {
          version: "3.0",
          data: { status: "active" }
        };
        
        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
        return res.json(response);
      }

      if (action === "INIT") {
        const response = {
          version: "3.0",
          screen: "SERVICE_FORM",
          data: {}
        };
        
        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
        return res.json(response);
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

        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
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
      const aesKey = (decryptedData as any)._aesKey;
      const initialVector = (decryptedData as any)._initialVector;

      if (action === "PING") {
        const response = {
          version: "3.0",
          data: { status: "active" }
        };
        
        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
        return res.json(response);
      }

      if (action === "INIT") {
        const response = {
          version: "3.0",
          screen: "CALLBACK_FORM",
          data: {}
        };
        
        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
        return res.json(response);
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

        if (aesKey && initialVector) {
          const encryptedResponse = this.encryptResponse(response, aesKey, initialVector);
          return res.status(200).contentType('text/plain').send(encryptedResponse);
        }
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

  private decryptFlowData(body: any): FlowDataExchangeRequest {
    // Check if the request is encrypted (has the 3 encryption fields)
    if (body.encrypted_flow_data && body.encrypted_aes_key && body.initial_vector) {
      return this.decryptEncryptedRequest(body as EncryptedFlowRequest);
    }
    
    // If not encrypted, return as-is (for backward compatibility during development)
    return body as FlowDataExchangeRequest;
  }

  private decryptEncryptedRequest(encryptedRequest: EncryptedFlowRequest): FlowDataExchangeRequest {
    try {
      const privateKey = process.env.WHATSAPP_FLOW_PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error("WHATSAPP_FLOW_PRIVATE_KEY environment variable is not set");
      }

      // Format the private key properly (replace literal \n with actual newlines)
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

      // Decode base64 inputs
      const encryptedAesKey = Buffer.from(encryptedRequest.encrypted_aes_key, 'base64');
      const encryptedFlowData = Buffer.from(encryptedRequest.encrypted_flow_data, 'base64');
      const initialVector = Buffer.from(encryptedRequest.initial_vector, 'base64');

      // Decrypt AES key using RSA private key
      const rsaPrivateKey = crypto.createPrivateKey({
        key: formattedPrivateKey,
        format: 'pem',
      });

      const aesKey = crypto.privateDecrypt(
        {
          key: rsaPrivateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        encryptedAesKey
      );

      // Extract auth tag (last 16 bytes) and ciphertext
      const authTag = encryptedFlowData.slice(-16);
      const ciphertext = encryptedFlowData.slice(0, -16);

      // Decrypt flow data using AES-256-GCM
      const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, initialVector);
      decipher.setAuthTag(authTag);

      const decryptedData = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
      ]);

      const parsedData = JSON.parse(decryptedData.toString('utf8'));
      
      // Store the AES key and IV in the request for later encryption of response
      (parsedData as any)._aesKey = aesKey;
      (parsedData as any)._initialVector = initialVector;
      
      return parsedData;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt WhatsApp Flow request");
    }
  }

  private encryptResponse(responseData: any, aesKey: Buffer, initialVector: Buffer): string {
    try {
      // Flip the IV (reverse bytes) for encryption
      const flippedIv = Buffer.from(initialVector).reverse();

      // Encrypt response using AES-256-GCM
      const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, flippedIv);
      
      const encryptedData = Buffer.concat([
        cipher.update(JSON.stringify(responseData), 'utf8'),
        cipher.final(),
        cipher.getAuthTag() // Append auth tag
      ]);

      // Return the encrypted response as base64 string (WhatsApp expects plain text, not JSON)
      return encryptedData.toString('base64');
    } catch (error) {
      console.error("Encryption error:", error);
      throw new Error("Failed to encrypt WhatsApp Flow response");
    }
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
