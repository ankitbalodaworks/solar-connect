// WhatsApp Flow Manager - Handles automatic flow creation, updates, and syncing with Meta
import { storage } from "./storage";
import { InsertWhatsappFlow, WhatsappFlow } from "@shared/schema";
import axios, { AxiosError } from "axios";
import FormData from "form-data";
import { 
  SURVEY_FLOW, SURVEY_FLOW_HI,
  CALLBACK_FLOW, CALLBACK_FLOW_HI,
  TRUST_FLOW, TRUST_FLOW_HI,
  ELIGIBILITY_FLOW, ELIGIBILITY_FLOW_HI,
  PRICE_FLOW, PRICE_FLOW_HI,
  SERVICE_FLOW, SERVICE_FLOW_HI
} from "./whatsappFlows";

interface FlowDefinition {
  flowType: string;
  language: string;
  flowKey: string;
  flowName: string;
  flowJson: any;
  categories: string[];
}

interface MetaFlowResponse {
  id: string;
  name: string;
  status: string;
  categories: string[];
  validation_errors?: any[];
}

interface MetaFlowListResponse {
  data: MetaFlowResponse[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

export class WhatsAppFlowManager {
  private readonly accessToken: string;
  private readonly wabaId: string;
  private readonly graphApiUrl = "https://graph.facebook.com/v19.0";
  private flowDefinitions: FlowDefinition[];

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";
    
    if (!this.accessToken) {
      console.error("[FLOW MANAGER] Missing WHATSAPP_ACCESS_TOKEN");
    }
    if (!this.wabaId) {
      console.error("[FLOW MANAGER] Missing WHATSAPP_BUSINESS_ACCOUNT_ID");
    }

    // Initialize flow definitions
    this.flowDefinitions = this.getFlowDefinitions();
  }

  private getFlowDefinitions(): FlowDefinition[] {
    return [
      // Survey Flows
      {
        flowType: "survey",
        language: "en",
        flowKey: "survey_en",
        flowName: "Sunshine Power - Site Survey (EN)",
        flowJson: SURVEY_FLOW,
        categories: ["APPOINTMENT_BOOKING", "LEAD_GENERATION"]
      },
      {
        flowType: "survey",
        language: "hi",
        flowKey: "survey_hi",
        flowName: "Sunshine Power - Site Survey (HI)",
        flowJson: SURVEY_FLOW_HI,
        categories: ["APPOINTMENT_BOOKING", "LEAD_GENERATION"]
      },
      // Callback Flows
      {
        flowType: "callback",
        language: "en",
        flowKey: "callback_en",
        flowName: "Sunshine Power - Callback Request (EN)",
        flowJson: CALLBACK_FLOW,
        categories: ["CONTACT_US", "CUSTOMER_SUPPORT"]
      },
      {
        flowType: "callback",
        language: "hi",
        flowKey: "callback_hi",
        flowName: "Sunshine Power - Callback Request (HI)",
        flowJson: CALLBACK_FLOW_HI,
        categories: ["CONTACT_US", "CUSTOMER_SUPPORT"]
      },
      // Trust Flows
      {
        flowType: "trust",
        language: "en",
        flowKey: "trust_en",
        flowName: "Sunshine Power - Trust Info (EN)",
        flowJson: TRUST_FLOW,
        categories: ["OTHER"]
      },
      {
        flowType: "trust",
        language: "hi",
        flowKey: "trust_hi",
        flowName: "Sunshine Power - Trust Info (HI)",
        flowJson: TRUST_FLOW_HI,
        categories: ["OTHER"]
      },
      // Eligibility Flows
      {
        flowType: "eligibility",
        language: "en",
        flowKey: "eligibility_en",
        flowName: "Sunshine Power - Eligibility Check (EN)",
        flowJson: ELIGIBILITY_FLOW,
        categories: ["LEAD_GENERATION", "OTHER"]
      },
      {
        flowType: "eligibility",
        language: "hi",
        flowKey: "eligibility_hi",
        flowName: "Sunshine Power - Eligibility Check (HI)",
        flowJson: ELIGIBILITY_FLOW_HI,
        categories: ["LEAD_GENERATION", "OTHER"]
      },
      // Legacy Price Flows (for backwards compatibility)
      {
        flowType: "price",
        language: "en",
        flowKey: "price_en",
        flowName: "Sunshine Power - Price Estimate (EN)",
        flowJson: PRICE_FLOW,
        categories: ["LEAD_GENERATION", "OTHER"]
      },
      {
        flowType: "price",
        language: "hi",
        flowKey: "price_hi",
        flowName: "Sunshine Power - Price Estimate (HI)",
        flowJson: PRICE_FLOW_HI,
        categories: ["LEAD_GENERATION", "OTHER"]
      },
      // Legacy Service Flows (for backwards compatibility)
      {
        flowType: "service",
        language: "en",
        flowKey: "service_en",
        flowName: "Sunshine Power - Service Request (EN)",
        flowJson: SERVICE_FLOW,
        categories: ["CUSTOMER_SUPPORT", "OTHER"]
      },
      {
        flowType: "service",
        language: "hi",
        flowKey: "service_hi",
        flowName: "Sunshine Power - Service Request (HI)",
        flowJson: SERVICE_FLOW_HI,
        categories: ["CUSTOMER_SUPPORT", "OTHER"]
      }
    ];
  }

  // Create a new flow in WhatsApp
  async createFlow(flowDef: FlowDefinition): Promise<{ success: boolean; flowId?: string; error?: string }> {
    try {
      console.log(`[FLOW MANAGER] Creating flow: ${flowDef.flowName}`);
      
      const url = `${this.graphApiUrl}/${this.wabaId}/flows`;
      
      // Prepare form data
      const formData = new FormData();
      formData.append("name", flowDef.flowName);
      formData.append("categories", JSON.stringify(flowDef.categories));
      
      // Convert flow JSON to buffer and append
      const flowJsonBuffer = Buffer.from(JSON.stringify(flowDef.flowJson));
      formData.append("file", flowJsonBuffer, {
        filename: `${flowDef.flowKey}.json`,
        contentType: "application/json"
      });

      const response = await axios.post(url, formData, {
        headers: {
          ...formData.getHeaders(),
          "Authorization": `Bearer ${this.accessToken}`
        }
      });

      const flowId = response.data.id;
      console.log(`[FLOW MANAGER] Flow created successfully: ${flowId}`);
      
      return { success: true, flowId };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = this.extractErrorMessage(axiosError);
      console.error(`[FLOW MANAGER] Error creating flow ${flowDef.flowName}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Update an existing flow
  async updateFlow(flowId: string, flowDef: FlowDefinition): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[FLOW MANAGER] Updating flow: ${flowId}`);
      
      const url = `${this.graphApiUrl}/${flowId}`;
      
      // Prepare form data for update
      const formData = new FormData();
      formData.append("name", flowDef.flowName);
      formData.append("categories", JSON.stringify(flowDef.categories));
      
      // Convert flow JSON to buffer and append
      const flowJsonBuffer = Buffer.from(JSON.stringify(flowDef.flowJson));
      formData.append("file", flowJsonBuffer, {
        filename: `${flowDef.flowKey}.json`,
        contentType: "application/json"
      });

      const response = await axios.post(url, formData, {
        headers: {
          ...formData.getHeaders(),
          "Authorization": `Bearer ${this.accessToken}`
        }
      });

      console.log(`[FLOW MANAGER] Flow updated successfully`);
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = this.extractErrorMessage(axiosError);
      console.error(`[FLOW MANAGER] Error updating flow ${flowId}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Publish a flow to make it live
  async publishFlow(flowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[FLOW MANAGER] Publishing flow: ${flowId}`);
      
      const url = `${this.graphApiUrl}/${flowId}/publish`;
      
      const response = await axios.post(url, {}, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json"
        }
      });

      console.log(`[FLOW MANAGER] Flow published successfully`);
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = this.extractErrorMessage(axiosError);
      console.error(`[FLOW MANAGER] Error publishing flow ${flowId}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Get flow details from WhatsApp
  async getFlowDetails(flowId: string): Promise<MetaFlowResponse | null> {
    try {
      const url = `${this.graphApiUrl}/${flowId}?fields=id,name,status,categories,validation_errors`;
      
      const response = await axios.get(url, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = this.extractErrorMessage(axiosError);
      console.error(`[FLOW MANAGER] Error getting flow details ${flowId}:`, errorMessage);
      return null;
    }
  }

  // List all flows from WhatsApp
  async listFlows(): Promise<MetaFlowResponse[]> {
    try {
      console.log(`[FLOW MANAGER] Listing all flows`);
      
      const url = `${this.graphApiUrl}/${this.wabaId}/flows?fields=id,name,status,categories`;
      
      const response = await axios.get<MetaFlowListResponse>(url, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });

      return response.data.data || [];
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = this.extractErrorMessage(axiosError);
      console.error(`[FLOW MANAGER] Error listing flows:`, errorMessage);
      return [];
    }
  }

  // Delete a flow (only works for DRAFT flows)
  async deleteFlow(flowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[FLOW MANAGER] Deleting flow: ${flowId}`);
      
      const url = `${this.graphApiUrl}/${flowId}`;
      
      await axios.delete(url, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`
        }
      });

      console.log(`[FLOW MANAGER] Flow deleted successfully`);
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = this.extractErrorMessage(axiosError);
      console.error(`[FLOW MANAGER] Error deleting flow ${flowId}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Deprecate a published flow
  async deprecateFlow(flowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[FLOW MANAGER] Deprecating flow: ${flowId}`);
      
      const url = `${this.graphApiUrl}/${flowId}/deprecate`;
      
      await axios.post(url, {}, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json"
        }
      });

      console.log(`[FLOW MANAGER] Flow deprecated successfully`);
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = this.extractErrorMessage(axiosError);
      console.error(`[FLOW MANAGER] Error deprecating flow ${flowId}:`, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Sync all flows with WhatsApp
  async syncAllFlows(): Promise<{
    success: boolean;
    created: number;
    updated: number;
    failed: number;
    errors: string[];
  }> {
    console.log("[FLOW MANAGER] Starting flow sync...");
    
    const results = {
      success: true,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Get existing flows from WhatsApp
    const existingFlows = await this.listFlows();
    const existingFlowsByName = new Map(existingFlows.map(f => [f.name, f]));
    
    // Process each flow definition
    for (const flowDef of this.flowDefinitions) {
      try {
        // Check if flow exists in database
        let dbFlow = await storage.getWhatsappFlow(flowDef.flowKey);
        
        // Check if flow exists in WhatsApp
        const existingMetaFlow = existingFlowsByName.get(flowDef.flowName);
        
        if (!dbFlow) {
          // Create new flow record in database
          const flowData: InsertWhatsappFlow = {
            flowKey: flowDef.flowKey,
            flowType: flowDef.flowType,
            language: flowDef.language,
            flowName: flowDef.flowName,
            flowJson: flowDef.flowJson,
            categories: flowDef.categories,
            status: "draft",
            version: "7.2"
          };
          
          if (existingMetaFlow) {
            // Flow exists in WhatsApp but not in DB - sync it
            flowData.metaFlowId = existingMetaFlow.id;
            flowData.status = existingMetaFlow.status.toLowerCase();
            flowData.lastSyncedAt = new Date();
            console.log(`[FLOW MANAGER] Syncing existing WhatsApp flow to DB: ${flowDef.flowName}`);
          } else {
            // Create new flow in WhatsApp
            const createResult = await this.createFlow(flowDef);
            if (createResult.success && createResult.flowId) {
              flowData.metaFlowId = createResult.flowId;
              flowData.lastSyncedAt = new Date();
              
              // Publish the flow
              const publishResult = await this.publishFlow(createResult.flowId);
              if (publishResult.success) {
                flowData.status = "published";
                results.created++;
                console.log(`[FLOW MANAGER] Created and published: ${flowDef.flowName}`);
              } else {
                flowData.status = "draft";
                flowData.errorMessage = publishResult.error;
                results.errors.push(`Failed to publish ${flowDef.flowName}: ${publishResult.error}`);
              }
            } else {
              flowData.status = "error";
              flowData.errorMessage = createResult.error;
              results.failed++;
              results.errors.push(`Failed to create ${flowDef.flowName}: ${createResult.error}`);
            }
          }
          
          dbFlow = await storage.createWhatsappFlow(flowData);
        } else if (existingMetaFlow) {
          // Flow exists in both DB and WhatsApp - update if needed
          const needsUpdate = dbFlow.version < (flowDef.flowJson.version || 1) ||
                            dbFlow.status === "draft";
          
          if (needsUpdate) {
            const updateResult = await this.updateFlow(existingMetaFlow.id, flowDef);
            if (updateResult.success) {
              // Publish if not already published
              if (existingMetaFlow.status !== "PUBLISHED") {
                await this.publishFlow(existingMetaFlow.id);
              }
              
              await storage.updateWhatsappFlow(flowDef.flowKey, {
                flowJson: flowDef.flowJson,
                version: flowDef.flowJson.version || 1,
                status: "published",
                lastSyncedAt: new Date(),
                errorMessage: null
              });
              
              results.updated++;
              console.log(`[FLOW MANAGER] Updated: ${flowDef.flowName}`);
            } else {
              await storage.updateWhatsappFlow(flowDef.flowKey, {
                status: "error",
                errorMessage: updateResult.error
              });
              results.failed++;
              results.errors.push(`Failed to update ${flowDef.flowName}: ${updateResult.error}`);
            }
          } else {
            console.log(`[FLOW MANAGER] Flow up to date: ${flowDef.flowName}`);
          }
        } else if (dbFlow && !existingMetaFlow) {
          // Flow in DB but not in WhatsApp - create it
          const createResult = await this.createFlow(flowDef);
          if (createResult.success && createResult.flowId) {
            // Publish the flow
            const publishResult = await this.publishFlow(createResult.flowId);
            
            await storage.updateWhatsappFlow(flowDef.flowKey, {
              metaFlowId: createResult.flowId,
              status: publishResult.success ? "published" : "draft",
              lastSyncedAt: new Date(),
              errorMessage: publishResult.success ? null : publishResult.error
            });
            
            results.created++;
            console.log(`[FLOW MANAGER] Recreated in WhatsApp: ${flowDef.flowName}`);
          } else {
            await storage.updateWhatsappFlow(flowDef.flowKey, {
              status: "error",
              errorMessage: createResult.error
            });
            results.failed++;
            results.errors.push(`Failed to recreate ${flowDef.flowName}: ${createResult.error}`);
          }
        }
      } catch (error) {
        console.error(`[FLOW MANAGER] Error processing flow ${flowDef.flowName}:`, error);
        results.failed++;
        results.errors.push(`Error processing ${flowDef.flowName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.log(`[FLOW MANAGER] Sync completed - Created: ${results.created}, Updated: ${results.updated}, Failed: ${results.failed}`);
    
    if (results.failed > 0) {
      results.success = false;
    }
    
    return results;
  }

  // Get flow status summary
  async getFlowStatusSummary(): Promise<{
    total: number;
    published: number;
    draft: number;
    error: number;
    flows: WhatsappFlow[];
  }> {
    const flows = await storage.getWhatsappFlows();
    
    return {
      total: flows.length,
      published: flows.filter(f => f.status === "published").length,
      draft: flows.filter(f => f.status === "draft").length,
      error: flows.filter(f => f.status === "error").length,
      flows
    };
  }

  // Helper to extract error messages from Axios errors
  private extractErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      const data = error.response.data as any;
      if (data.error?.message) {
        return data.error.message;
      }
      if (data.message) {
        return data.message;
      }
      return JSON.stringify(data);
    }
    return error.message || "Unknown error";
  }
}

// Export singleton instance
export const flowManager = new WhatsAppFlowManager();