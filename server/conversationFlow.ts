import { storage } from "./storage";
import { type ConversationState, type MessageTemplate } from "@shared/schema";
import { whatsappService } from "./whatsapp";

interface IncomingMessage {
  customerPhone: string;
  customerName?: string;
  messageType: "text" | "button" | "list";
  content: string;
  selectedButtonId?: string;
  selectedListItemId?: string;
}

interface OutgoingMessage {
  template: MessageTemplate | null;
  shouldSend: boolean;
  error?: string;
  isFlow?: boolean;
  flowSent?: boolean;
}

export class ConversationFlowEngine {
  async handleIncomingMessage(message: IncomingMessage): Promise<OutgoingMessage> {
    try {
      await storage.createWhatsappLog({
        customerPhone: message.customerPhone,
        direction: "inbound",
        messageType: message.messageType,
        content: {
          text: message.content,
          buttonId: message.selectedButtonId,
          listItemId: message.selectedListItemId,
        },
        status: "received",
      });

      // Check for main menu button IDs FIRST - these should trigger flows regardless of conversation state
      // This prevents timing issues where conversation state might be missing after a flow is sent
      if (message.selectedButtonId) {
        const flowMapping: Record<string, string> = {
          "site_survey": "survey",
          "request_callback": "callback",
          "why_sunshine": "trust",
          // Legacy mappings for backwards compatibility
          "price_estimate": "price",
          "maintenance": "service",
          "callback": "callback",
        };

        const flowType = flowMapping[message.selectedButtonId];

        if (flowType) {
          // Get or create conversation state to determine language
          let conversationState = await storage.getConversationState(message.customerPhone);
          console.log('[FLOW] Got conversation state:', conversationState);
          const language = conversationState?.language || "en";
          console.log('[FLOW] Selected language for', flowType, 'flow:', language);

          const flowResult = await this.sendWhatsAppFlow(
            message.customerPhone,
            flowType,
            language
          );

          if (flowResult.success) {
            // Delete conversation state as flow will handle the rest
            await storage.deleteConversationState(message.customerPhone);

            return {
              template: null,
              shouldSend: false,
              isFlow: true,
              flowSent: true,
            };
          } else {
            return {
              template: null,
              shouldSend: false,
              error: flowResult.error || "Failed to send WhatsApp Flow",
            };
          }
        }
      }

      // Now proceed with normal conversation state handling
      let conversationState = await storage.getConversationState(message.customerPhone);

      if (!conversationState) {
        conversationState = await this.initializeConversation(message);
      } else {
        if (conversationState) {
          conversationState = await this.processStateTransition(conversationState, message);
        }
      }

      if (!conversationState) {
        return {
          template: null as any,
          shouldSend: false,
          error: "Failed to initialize or update conversation state",
        };
      }

      const nextTemplate = await this.resolveNextTemplate(conversationState);

      if (!nextTemplate) {
        return {
          template: null as any,
          shouldSend: false,
          error: "No template found for current state",
        };
      }

      // Check if we're at a completion step and already sent the message
      if (this.isCompletionStep(conversationState.currentStep)) {
        const context = conversationState.context as any || {};
        if (context._completeSent) {
          return {
            template: null as any,
            shouldSend: false,
          };
        }
        // Mark that we're sending the complete message
        await storage.updateConversationState(conversationState.customerPhone, {
          context: { ...context, _completeSent: true },
        });
      }

      await storage.createWhatsappLog({
        customerPhone: message.customerPhone,
        direction: "outbound",
        messageType: nextTemplate.messageType,
        content: {
          bodyText: nextTemplate.bodyText,
          headerText: nextTemplate.headerText,
          footerText: nextTemplate.footerText,
          buttons: nextTemplate.buttons,
          listSections: nextTemplate.listSections,
        },
        status: "pending",
      });

      return {
        template: nextTemplate,
        shouldSend: true,
      };
    } catch (error) {
      console.error("Error handling incoming message:", error);
      return {
        template: null as any,
        shouldSend: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async initializeConversation(message: IncomingMessage): Promise<ConversationState | undefined> {
    // Always start with campaign_entry step for new conversations
    const newState = await storage.createConversationState({
      customerPhone: message.customerPhone,
      customerName: message.customerName,
      flowType: "campaign",
      currentStep: "campaign_entry",
      language: null,
      context: {},
    });

    return newState;
  }

  private async processStateTransition(
    currentState: ConversationState,
    message: IncomingMessage
  ): Promise<ConversationState | undefined> {
    // Check if we're at a completion step and have already sent the completion message
    if (this.isCompletionStep(currentState.currentStep)) {
      const context = currentState.context as any || {};
      if (context._completeSent) {
        // Conversation is complete, delete the state and restart for any new message
        console.log(`Conversation already completed at ${currentState.currentStep}, restarting flow`);
        return await this.restartConversation(message.customerPhone);
      }
    }

    // Fetch current step template
    const templates = await storage.getMessageTemplates(
      "campaign",
      currentState.language || undefined,
      currentState.currentStep
    );

    const currentTemplate = templates[0];

    // Stateless fallback: if no template found or unrecognized input, restart from campaign_entry
    if (!currentTemplate) {
      console.log(`No template found for step ${currentState.currentStep}, restarting flow`);
      return await this.restartConversation(message.customerPhone);
    }

    let nextStep = currentState.currentStep;
    let language = currentState.language;
    const updatedContext = { ...(currentState.context as any || {}) };

    // Handle button responses
    if (currentTemplate.messageType === "button" && message.selectedButtonId) {
      const buttons = currentTemplate.buttons as any[];
      const selectedButton = buttons?.find((btn: any) => btn.id === message.selectedButtonId);

      if (!selectedButton) {
        // Unrecognized button, restart flow
        console.log(`Unrecognized button ${message.selectedButtonId}, restarting flow`);
        return await this.restartConversation(message.customerPhone);
      }

      // Handle language selection at campaign_entry
      if (currentState.currentStep === "campaign_entry") {
        if (message.selectedButtonId === "hindi") {
          language = "hi";
          nextStep = "main_menu";
          console.log('[LANG] User selected Hindi, setting language to "hi"');
        } else if (message.selectedButtonId === "english") {
          language = "en";
          nextStep = "main_menu";
          console.log('[LANG] User selected English, setting language to "en"');
        } else {
          // Unrecognized button at entry, restart
          console.log(`Unrecognized button ${message.selectedButtonId} at campaign_entry, restarting flow`);
          return await this.restartConversation(message.customerPhone);
        }
      } else if (currentState.currentStep === "main_menu" && message.selectedButtonId) {
        // Main menu button handling
        if (message.selectedButtonId === "site_survey" || message.selectedButtonId === "price_estimate") {
          // These are handled earlier in the flow (WhatsApp Flows)
          nextStep = currentState.currentStep;
        } else if (message.selectedButtonId === "help") {
          nextStep = "help_submenu";
        } else {
          console.log(`Unrecognized main menu button ${message.selectedButtonId}, restarting flow`);
          return await this.restartConversation(message.customerPhone);
        }
      } else if (selectedButton.nextStep) {
        // Follow the nextStep defined in the button
        nextStep = selectedButton.nextStep;
      } else {
        // No explicit nextStep, stay on current step
        nextStep = currentState.currentStep;
      }

      // Store button selection in context
      updatedContext[currentState.currentStep] = {
        buttonId: message.selectedButtonId,
        buttonTitle: selectedButton.title,
      };
    } 
    // Handle list responses
    else if (currentTemplate.messageType === "list" && message.selectedListItemId) {
      const listSections = currentTemplate.listSections as any[];
      let selectedItem: any = null;

      for (const section of listSections || []) {
        selectedItem = section.rows?.find((row: any) => row.id === message.selectedListItemId);
        if (selectedItem) break;
      }

      if (!selectedItem || !selectedItem.nextStep) {
        // Unrecognized list item or missing nextStep, restart flow
        console.log(`Unrecognized list item ${message.selectedListItemId}, restarting flow`);
        return await this.restartConversation(message.customerPhone);
      }

      nextStep = selectedItem.nextStep;

      // Store list selection in context
      updatedContext[currentState.currentStep] = {
        itemId: message.selectedListItemId,
        itemTitle: selectedItem.title,
      };
    } 
    // Handle text responses
    else if (currentTemplate.messageType === "text" || message.messageType === "text") {
      // Special handling for 'W' or 'w' at campaign_entry (visit website)
      if (currentState.currentStep === "campaign_entry" && 
          (message.content.trim().toLowerCase() === "w" || 
           message.content.trim().toLowerCase() === "website" ||
           message.content.trim().toLowerCase() === "वेबसाइट")) {
        // Create event for website visit
        await storage.createEvent({
          customerPhone: message.customerPhone,
          type: "website_visit_requested",
          meta: { source: "campaign_entry" },
        });

        // Move to a special website_complete step that will send the link and end conversation
        return await storage.updateConversationState(message.customerPhone, {
          currentStep: "website_complete",
        });
      }

      // Store text input in context
      updatedContext[currentState.currentStep] = {
        text: message.content,
      };

      // For text inputs, determine next step based on current step
      const textNextStep = this.getNextStepForTextInput(currentState.currentStep);

      if (!textNextStep) {
        // Unknown text step, restart flow
        console.log(`Unknown text step ${currentState.currentStep}, restarting flow`);
        return await this.restartConversation(message.customerPhone);
      }

      nextStep = textNextStep;
    } 
    // Unrecognized message type or missing expected interaction
    else {
      console.log(`Unexpected message type or missing interaction for step ${currentState.currentStep}, restarting flow`);
      return await this.restartConversation(message.customerPhone);
    }

    // If conversation is completing, create the appropriate record
    if (this.isCompletionStep(nextStep)) {
      await this.createRecordFromConversation(currentState, updatedContext, nextStep);
    }

    console.log('[STATE] Updating conversation state with language:', language, 'step:', nextStep);
    const updatedState = await storage.updateConversationState(currentState.customerPhone, {
      currentStep: nextStep,
      language,
      context: updatedContext,
    });
    console.log('[STATE] Updated conversation state:', updatedState);

    return updatedState;
  }

  private async restartConversation(customerPhone: string): Promise<ConversationState> {
    // Delete existing state and restart from campaign_entry
    await storage.deleteConversationState(customerPhone);

    const newState = await storage.createConversationState({
      customerPhone,
      customerName: undefined,
      flowType: "campaign",
      currentStep: "campaign_entry",
      language: null,
      context: {},
    });

    return newState;
  }

  private async sendWhatsAppFlow(
    customerPhone: string,
    flowType: string,
    language: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First try to get flow ID from database
      const dbFlow = await storage.getWhatsappFlowByTypeAndLanguage(flowType, language);
      
      let flowId: string = "";
      
      if (dbFlow && dbFlow.metaFlowId && dbFlow.status === "published") {
        // Use database-stored flow ID if available and published
        flowId = dbFlow.metaFlowId;
        console.log('[FLOW-ID] Using database flow ID for type:', flowType, 'language:', language, 'ID:', flowId);
      } else {
        // Fallback to environment variables for backward compatibility
        // Map flow type to flow ID from environment variables (language-specific)
        const flowIdMapping: Record<string, Record<string, string>> = {
          survey: {
            en: process.env.WHATSAPP_FLOW_ID_SURVEY || "",
            hi: process.env.WHATSAPP_FLOW_ID_SURVEY_HI || process.env.WHATSAPP_FLOW_ID_SURVEY || "",
          },
          callback: {
            en: process.env.WHATSAPP_FLOW_ID_CALLBACK || "",
            hi: process.env.WHATSAPP_FLOW_ID_CALLBACK_HI || process.env.WHATSAPP_FLOW_ID_CALLBACK || "",
          },
          trust: {
            en: process.env.WHATSAPP_FLOW_ID_TRUST || "",
            hi: process.env.WHATSAPP_FLOW_ID_TRUST_HI || process.env.WHATSAPP_FLOW_ID_TRUST || "",
          },
          eligibility: {
            en: process.env.WHATSAPP_FLOW_ID_ELIGIBILITY || "",
            hi: process.env.WHATSAPP_FLOW_ID_ELIGIBILITY_HI || process.env.WHATSAPP_FLOW_ID_ELIGIBILITY || "",
          },
          // Legacy flow types (for backwards compatibility)
          price: {
            en: process.env.WHATSAPP_FLOW_ID_PRICE || "",
            hi: process.env.WHATSAPP_FLOW_ID_PRICE_HI || process.env.WHATSAPP_FLOW_ID_PRICE || "",
          },
          service: {
            en: process.env.WHATSAPP_FLOW_ID_SERVICE || "",
            hi: process.env.WHATSAPP_FLOW_ID_SERVICE_HI || process.env.WHATSAPP_FLOW_ID_SERVICE || "",
          },
        };

        // Get the flow ID based on language, fallback to English if language-specific ID not found
        console.log('[FLOW-ID] Falling back to environment variables for type:', flowType, 'language:', language);
        flowId = flowIdMapping[flowType]?.[language] || flowIdMapping[flowType]?.en || "";
        console.log('[FLOW-ID] Selected env flow ID:', flowId);
      }

      if (!flowId) {
        const langSuffix = language === "hi" ? "_HI" : "";
        return {
          success: false,
          error: `Flow ID not configured for ${flowType} (${language}). Please run flow sync from WhatsApp Flows page or set WHATSAPP_FLOW_ID_${flowType.toUpperCase()}${langSuffix} environment variable.`,
        };
      }

      // Generate flow token with customer phone and flow type
      const flowToken = whatsappService.generateFlowToken(customerPhone, flowType);

      // Get flow text based on language
      const flowTexts: Record<string, Record<string, { body: string; button: string }>> = {
        survey: {
          en: {
            body: "Please fill out this quick form to schedule your free rooftop solar site survey.",
            button: "Book Survey",
          },
          hi: {
            body: "कृपया अपने मुफ्त छत सोलर साइट सर्वेक्षण को शेड्यूल करने के लिए यह फॉर्म भरें।",
            button: "सर्वे बुक करें",
          },
        },
        callback: {
          en: {
            body: "Request a callback from our team - takes under 1 minute.",
            button: "Request Callback",
          },
          hi: {
            body: "हमारी टीम से कॉलबैक का अनुरोध करें - 1 मिनट से कम में।",
            button: "कॉलबैक का अनुरोध करें",
          },
        },
        trust: {
          en: {
            body: "Learn more about our credentials, warranties, and successful installations.",
            button: "Learn More",
          },
          hi: {
            body: "हमारे प्रमाणपत्र, वारंटी और सफल इंस्टॉलेशन के बारे में जानें।",
            button: "और जानें",
          },
        },
        eligibility: {
          en: {
            body: "Check your eligibility and get a quick estimate based on your electricity bill.",
            button: "Check Eligibility",
          },
          hi: {
            body: "अपनी पात्रता जांचें और अपने बिजली बिल के आधार पर त्वरित अनुमान प्राप्त करें।",
            button: "पात्रता जांचें",
          },
        },
        // Legacy flow texts (for backwards compatibility)
        price: {
          en: {
            body: "Get an instant price estimate for your solar installation.",
            button: "Get Estimate",
          },
          hi: {
            body: "अपने सोलर इंस्टॉलेशन के लिए तुरंत मूल्य अनुमान प्राप्त करें।",
            button: "अनुमान प्राप्त करें",
          },
        },
        service: {
          en: {
            body: "Request maintenance or service for your existing solar installation.",
            button: "Request Service",
          },
          hi: {
            body: "अपने मौजूदा सोलर इंस्टॉलेशन के लिए रखरखाव या सेवा का अनुरोध करें।",
            button: "सेवा का अनुरोध करें",
          },
        },
      };

      const text = flowTexts[flowType]?.[language] || flowTexts[flowType].en;

      // Send WhatsApp Flow message
      const result = await whatsappService.sendFlowMessage(
        customerPhone,
        flowId,
        text.body,
        text.button,
        flowToken
      );

      if (result.success) {
        // Log the flow message
        await storage.createWhatsappLog({
          customerPhone,
          direction: "outbound",
          messageType: "button",
          content: {
            bodyText: text.body,
            flowId,
            flowType,
          },
          status: "sent",
        });

        return { success: true };
      } else {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (error) {
      console.error("Error sending WhatsApp Flow:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private isCompletionStep(step: string): boolean {
    return ["survey_complete", "callback_complete", "service_complete", "issue_complete", "website_complete"].includes(step);
  }

  private getNextStepForTextInput(currentStep: string): string | null {
    // Map text input steps to their next steps
    const textStepMapping: Record<string, string> = {
      // Site Survey Flow
      "survey_name": "survey_mobile",
      "survey_mobile": "survey_address",
      "survey_address": "survey_village",
      "survey_village": "survey_date",
      "survey_date": "survey_time",
      "survey_time": "survey_complete",

      // Callback Flow
      "callback_name": "callback_mobile",
      "callback_mobile": "callback_complete",

      // Service Flow
      "service_name": "service_mobile",
      "service_mobile": "service_address",
      "service_address": "service_village",
      "service_village": "service_urgency",
      // service_urgency is button type, not text
      "service_date": "service_complete",

      // Other Issue Flow
      "issue_name": "issue_mobile",
      "issue_mobile": "issue_address",
      "issue_address": "issue_village",
      "issue_village": "issue_description",
      "issue_description": "issue_complete",
    };

    return textStepMapping[currentStep] || null;
  }

  private async createRecordFromConversation(
    state: ConversationState,
    context: any,
    completionStep: string
  ): Promise<void> {
    try {
      if (completionStep === "survey_complete") {
        // Create Lead from site survey flow
        const customerName = context.survey_name?.text || state.customerName || "Customer";
        const customerPhone = context.survey_mobile?.text || state.customerPhone;
        const address = context.survey_address?.text;
        const village = context.survey_village?.text;
        const preferredSurveyDate = context.survey_date?.text;
        const preferredSurveyTime = context.survey_time?.text;

        await storage.createLead({
          customerPhone,
          customerName,
          interestedIn: "Solar Installation",
          preferredSurveyDate: preferredSurveyDate || null,
          preferredSurveyTime: preferredSurveyTime || null,
          notes: `Lead from WhatsApp. Language: ${state.language || 'not specified'}. Address: ${address || 'N/A'}. Village: ${village || 'N/A'}`,
        });

        // Create form_submitted event and form record
        await storage.createEvent({
          customerPhone: state.customerPhone,
          type: "form_submitted",
          meta: { formType: "site_survey" },
        });

        await storage.createForm({
          customerPhone: state.customerPhone,
          formType: "site_survey",
          data: {
            customerName,
            mobile: customerPhone,
            address,
            village,
            preferredDate: preferredSurveyDate,
            preferredTime: preferredSurveyTime,
          },
        });

        console.log(`Created lead for ${state.customerPhone}`);
      } 
      else if (completionStep === "callback_complete") {
        // Create Callback Request from callback flow
        const customerName = context.callback_name?.text || state.customerName || "Customer";
        const customerPhone = context.callback_mobile?.text || state.customerPhone;

        // Determine source based on which submenu led to callback
        let source: "price_estimate" | "help" = "price_estimate";
        if (context.help_submenu) {
          source = "help";
        }

        await storage.createCallbackRequest({
          customerPhone,
          customerName,
          source,
          status: "pending",
        });

        // Create form_submitted event and form record
        await storage.createEvent({
          customerPhone: state.customerPhone,
          type: "form_submitted",
          meta: { formType: "callback" },
        });

        await storage.createForm({
          customerPhone: state.customerPhone,
          formType: "callback",
          data: {
            customerName,
            mobile: customerPhone,
            source,
          },
        });

        console.log(`Created callback request for ${state.customerPhone}`);
      } 
      else if (completionStep === "service_complete") {
        // Create Service Request from service flow
        const customerName = context.service_name?.text || state.customerName || "Customer";
        const customerPhone = context.service_mobile?.text || state.customerPhone;
        const address = context.service_address?.text;
        const customerVillage = context.service_village?.text || null;
        const urgencySelection = context.service_urgency?.buttonId;
        const preferredDate = context.service_date?.text;

        let urgency: "low" | "medium" | "high" = "medium";
        if (urgencySelection === "low") {
          urgency = "low";
        } else if (urgencySelection === "high") {
          urgency = "high";
        }

        await storage.createServiceRequest({
          customerPhone,
          customerName,
          issueType: "Service-Repair",
          description: `Service request from WhatsApp. Address: ${address || 'N/A'}. Preferred date: ${preferredDate || 'N/A'}`,
          urgency,
          status: "pending",
          customerVillage,
          assignedTo: null,
        });

        // Create form_submitted event and form record
        await storage.createEvent({
          customerPhone: state.customerPhone,
          type: "form_submitted",
          meta: { formType: "service_request" },
        });

        await storage.createForm({
          customerPhone: state.customerPhone,
          formType: "service_request",
          data: {
            customerName,
            mobile: customerPhone,
            address,
            village: customerVillage,
            urgency,
            preferredDate,
          },
        });

        console.log(`Created service request for ${state.customerPhone}`);
      } 
      else if (completionStep === "issue_complete") {
        // Create Other Issue from issue flow
        const customerName = context.issue_name?.text || state.customerName || "Customer";
        const customerPhone = context.issue_mobile?.text || state.customerPhone;
        const address = context.issue_address?.text;
        const village = context.issue_village?.text;
        const description = context.issue_description?.text || "Not provided";

        await storage.createOtherIssue({
          customerPhone,
          customerName,
          issueDescription: description,
          status: "pending",
          customerAddress: address,
          customerVillage: village,
        });

        // Create form_submitted event and form record
        await storage.createEvent({
          customerPhone: state.customerPhone,
          type: "form_submitted",
          meta: { formType: "other_issue" },
        });

        await storage.createForm({
          customerPhone: state.customerPhone,
          formType: "other_issue",
          data: {
            customerName,
            mobile: customerPhone,
            address,
            village,
            description,
          },
        });

        console.log(`Created other issue for ${state.customerPhone}`);
      }
    } catch (error) {
      console.error("Error creating record from conversation:", error);
    }
  }

  private async resolveNextTemplate(state: ConversationState): Promise<MessageTemplate | undefined> {
    // Don't send template for completion steps (they are final messages)
    if (this.isCompletionStep(state.currentStep)) {
      // Actually, completion steps DO have templates - they're the thank you messages
      // So we should fetch them
      const templates = await storage.getMessageTemplates(
        "campaign",
        state.language || undefined,
        state.currentStep
      );
      return templates[0];
    }

    const templates = await storage.getMessageTemplates(
      "campaign",
      state.language || undefined,
      state.currentStep
    );

    return templates[0];
  }

  async startNewConversation(
    customerPhone: string,
    customerName: string
  ): Promise<OutgoingMessage> {
    const existingState = await storage.getConversationState(customerPhone);

    if (existingState) {
      await storage.deleteConversationState(customerPhone);
    }

    const newState = await storage.createConversationState({
      customerPhone,
      customerName,
      flowType: "campaign",
      currentStep: "campaign_entry",
      language: null,
      context: {},
    });

    const firstTemplate = await this.resolveNextTemplate(newState);

    if (!firstTemplate) {
      return {
        template: null as any,
        shouldSend: false,
        error: "No template found for campaign entry",
      };
    }

    await storage.createWhatsappLog({
      customerPhone,
      direction: "outbound",
      messageType: firstTemplate.messageType,
      content: {
        bodyText: firstTemplate.bodyText,
        headerText: firstTemplate.headerText,
        footerText: firstTemplate.footerText,
        buttons: firstTemplate.buttons,
        listSections: firstTemplate.listSections,
      },
      status: "pending",
    });

    return {
      template: firstTemplate,
      shouldSend: true,
    };
  }
}

export const conversationFlowEngine = new ConversationFlowEngine();