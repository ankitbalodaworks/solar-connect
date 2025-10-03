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
      let decryptedData;
      
      try {
        decryptedData = this.decryptFlowData(body);
      } catch (decryptError: any) {
        // If decryption fails due to key mismatch, return 421 to force WhatsApp to refresh cached public key
        const errorMsg = decryptError.message || String(decryptError);
        if (errorMsg.includes('Invalid AES key length') || 
            errorMsg.includes('OAEP') ||
            errorMsg.includes('oaep') ||
            errorMsg.includes('Public/private key mismatch') ||
            errorMsg.includes('Failed to decrypt')) {
          console.error('[FLOW SURVEY] Decryption failed - forcing WhatsApp to refresh public key (HTTP 421)');
          console.error('[FLOW SURVEY] Error:', errorMsg);
          console.error('[FLOW SURVEY] Wait 30 minutes after receiving this error for cache to clear');
          return res.status(421).json({ 
            error: "Encryption key mismatch - forcing client to refresh public key. Wait 30 minutes and try again." 
          });
        }
        throw decryptError;
      }
      
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
          customerName: formData.full_name,
          customerPhone: customerPhone,
          address: formData.address,
          village: formData.village,
          interestedIn: formData.interested_in || "site_survey",
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
      let decryptedData;
      
      try {
        decryptedData = this.decryptFlowData(body);
      } catch (decryptError: any) {
        if (decryptError.message?.includes('Invalid AES key length') || 
            decryptError.message?.includes('OAEP') ||
            decryptError.message?.includes('Public/private key mismatch')) {
          console.error('[FLOW] Decryption failed - forcing WhatsApp to refresh public key (HTTP 421)');
          return res.status(421).json({ 
            error: "Encryption key mismatch - forcing client to refresh public key. Wait 30 minutes and try again." 
          });
        }
        throw decryptError;
      }
      
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
          customerName: formData.full_name,
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
      let decryptedData;
      
      try {
        decryptedData = this.decryptFlowData(body);
      } catch (decryptError: any) {
        const errorMsg = decryptError.message || String(decryptError);
        if (errorMsg.includes('Invalid AES key length') || 
            errorMsg.includes('OAEP') ||
            errorMsg.includes('oaep') ||
            errorMsg.includes('Public/private key mismatch') ||
            errorMsg.includes('Failed to decrypt')) {
          console.error('[FLOW SERVICE] Decryption failed - forcing WhatsApp to refresh public key (HTTP 421)');
          console.error('[FLOW SERVICE] Error:', errorMsg);
          return res.status(421).json({ 
            error: "Encryption key mismatch - forcing client to refresh public key. Wait 30 minutes and try again." 
          });
        }
        throw decryptError;
      }
      
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
          customerName: formData.full_name,
          customerPhone: customerPhone,
          address: formData.address,
          customerVillage: formData.village,
          issueType: formData.issue_type,
          description: formData.description || `${formData.issue_type} issue`,
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
      let decryptedData;
      
      try {
        decryptedData = this.decryptFlowData(body);
      } catch (decryptError: any) {
        const errorMsg = decryptError.message || String(decryptError);
        if (errorMsg.includes('Invalid AES key length') || 
            errorMsg.includes('OAEP') ||
            errorMsg.includes('oaep') ||
            errorMsg.includes('Public/private key mismatch') ||
            errorMsg.includes('Failed to decrypt')) {
          console.error('[FLOW CALLBACK] Decryption failed - forcing WhatsApp to refresh public key (HTTP 421)');
          console.error('[FLOW CALLBACK] Error:', errorMsg);
          return res.status(421).json({ 
            error: "Encryption key mismatch - forcing client to refresh public key. Wait 30 minutes and try again." 
          });
        }
        throw decryptError;
      }
      
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
          customerName: formData.full_name,
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
      // Validate that the encrypted fields are valid base64 strings
      const isValidBase64 = (str: string): boolean => {
        try {
          return Buffer.from(str, 'base64').toString('base64') === str;
        } catch {
          return false;
        }
      };

      if (!isValidBase64(body.encrypted_aes_key) || 
          !isValidBase64(body.encrypted_flow_data) || 
          !isValidBase64(body.initial_vector)) {
        console.error('[FLOW] Invalid base64 encoding in encrypted request');
        throw new Error('Invalid encrypted data format');
      }

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

      // Log incoming encrypted data for debugging
      console.log('[CRYPTO DEBUG] Encrypted request received');
      console.log('[CRYPTO DEBUG] Encrypted AES key length:', encryptedRequest.encrypted_aes_key?.length || 0);
      console.log('[CRYPTO DEBUG] Encrypted AES key (first 40 chars):', encryptedRequest.encrypted_aes_key?.substring(0, 40) || 'N/A');
      console.log('[CRYPTO DEBUG] Encrypted flow data length:', encryptedRequest.encrypted_flow_data?.length || 0);
      console.log('[CRYPTO DEBUG] Encrypted flow data (first 40 chars):', encryptedRequest.encrypted_flow_data?.substring(0, 40) || 'N/A');
      console.log('[CRYPTO DEBUG] Initial vector length:', encryptedRequest.initial_vector?.length || 0);
      console.log('[CRYPTO DEBUG] Initial vector:', encryptedRequest.initial_vector || 'N/A');

      // Log key info for debugging (without exposing the actual key)
      console.log('[CRYPTO DEBUG] Private key length:', privateKey.length);
      console.log('[CRYPTO DEBUG] Key starts with:', privateKey.substring(0, 27));
      console.log('[CRYPTO DEBUG] Key ends with:', privateKey.substring(privateKey.length - 25));

      // Format the private key properly
      // 1. Replace literal \n with actual newlines
      let formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
      
      // 2. Fix single-line PEM (spaces instead of newlines between base64 chunks)
      if (formattedPrivateKey.startsWith('-----BEGIN PRIVATE KEY----- ')) {
        // Extract the parts
        const parts = formattedPrivateKey.split(' ');
        const header = parts.slice(0, 3).join(' '); // "-----BEGIN PRIVATE KEY-----"
        const footer = parts.slice(-3).join(' '); // "-----END PRIVATE KEY-----"
        const base64Lines = parts.slice(3, -3); // All the base64 chunks between header and footer
        
        // Reconstruct with proper newlines
        formattedPrivateKey = header + '\n' + base64Lines.join('\n') + '\n' + footer;
      }
      
      console.log('[CRYPTO DEBUG] Formatted key length:', formattedPrivateKey.length);
      console.log('[CRYPTO DEBUG] Has PEM headers:', formattedPrivateKey.includes('-----BEGIN') && formattedPrivateKey.includes('-----END'));

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

      console.log('[CRYPTO DEBUG] Decrypted AES key length:', aesKey.length, 'bytes');
      console.log('[CRYPTO DEBUG] Decrypted AES key (hex):', aesKey.toString('hex').substring(0, 40) + '...');

      // WhatsApp Flows uses AES-128 (16 bytes), not AES-256 (32 bytes)
      if (aesKey.length !== 16 && aesKey.length !== 32) {
        console.error('[CRYPTO ERROR] Invalid AES key length! Expected 16 (AES-128) or 32 (AES-256) bytes, got', aesKey.length);
        throw new Error(`Invalid AES key length: ${aesKey.length} bytes`);
      }
      
      const aesAlgorithm = aesKey.length === 16 ? 'aes-128-gcm' : 'aes-256-gcm';
      console.log('[CRYPTO DEBUG] Using algorithm:', aesAlgorithm);

      // Extract auth tag (last 16 bytes) and ciphertext
      const authTag = encryptedFlowData.slice(-16);
      const ciphertext = encryptedFlowData.slice(0, -16);

      // Decrypt flow data using AES-GCM (128 or 256 depending on key size)
      const decipher = crypto.createDecipheriv(aesAlgorithm, aesKey, initialVector);
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
      // Re-throw the original error to preserve the error message for 421 handling
      throw error;
    }
  }

  private encryptResponse(responseData: any, aesKey: Buffer, initialVector: Buffer): string {
    try {
      // WhatsApp Flows requires FLIPPING the IV for response encryption (XOR each byte with 0xFF)
      const flippedIV = Buffer.from(initialVector.map(byte => byte ^ 0xFF));
      
      console.log('[CRYPTO DEBUG] Original IV:', initialVector.toString('base64'));
      console.log('[CRYPTO DEBUG] Flipped IV:', flippedIV.toString('base64'));
      
      // Encrypt response using AES-GCM (128 or 256 depending on key size) with the flipped IV
      const aesAlgorithm = aesKey.length === 16 ? 'aes-128-gcm' : 'aes-256-gcm';
      const cipher = crypto.createCipheriv(aesAlgorithm, aesKey, flippedIV);
      
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
