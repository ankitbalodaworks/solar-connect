import { storage } from "./storage";
import { type ConversationState, type MessageTemplate } from "@shared/schema";

interface IncomingMessage {
  customerPhone: string;
  customerName?: string;
  messageType: "text" | "button" | "list";
  content: string;
  selectedButtonId?: string;
  selectedListItemId?: string;
}

interface OutgoingMessage {
  template: MessageTemplate;
  shouldSend: boolean;
  error?: string;
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

      let conversationState = await storage.getConversationState(message.customerPhone);

      if (!conversationState) {
        conversationState = await this.initializeConversation(message);
      } else {
        conversationState = await this.processStateTransition(conversationState, message);
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

      // Send the template for the current step (including "complete")
      // But if we're already at complete and have already sent it, check context
      if (conversationState.currentStep === "complete") {
        // Check if we've already sent the complete message
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
    const flowType = this.detectFlowType(message.content);

    const newState = await storage.createConversationState({
      customerPhone: message.customerPhone,
      customerName: message.customerName,
      flowType,
      currentStep: "language_select",
      language: null,
      context: {},
    });

    return newState;
  }

  private detectFlowType(messageContent: string): "campaign_lead" | "service_request" {
    const lowerContent = messageContent.toLowerCase();
    const serviceKeywords = ["service", "repair", "problem", "issue", "help", "fix", "समस्या", "मदद", "सेवा"];
    
    const hasServiceKeyword = serviceKeywords.some(keyword => lowerContent.includes(keyword));
    
    return hasServiceKeyword ? "service_request" : "campaign_lead";
  }

  private async processStateTransition(
    currentState: ConversationState,
    message: IncomingMessage
  ): Promise<ConversationState | undefined> {
    const templates = await storage.getMessageTemplates(
      currentState.flowType,
      currentState.language || undefined,
      currentState.currentStep
    );

    const currentTemplate = templates[0];
    
    if (!currentTemplate) {
      return currentState;
    }

    let nextStep = currentState.currentStep;
    let language = currentState.language;
    const updatedContext = { ...(currentState.context as any || {}) };

    if (currentTemplate.messageType === "button" && message.selectedButtonId) {
      const buttons = currentTemplate.buttons as any[];
      const selectedButton = buttons?.find((btn: any) => btn.id === message.selectedButtonId);
      
      if (currentState.currentStep === "language_select") {
        if (message.selectedButtonId === "en" || message.selectedButtonId === "english") {
          language = "en";
        } else if (message.selectedButtonId === "hi" || message.selectedButtonId === "hindi") {
          language = "hi";
        }
        nextStep = this.getNextStepAfterLanguage(currentState.flowType);
      } else if (selectedButton?.nextStep) {
        nextStep = selectedButton.nextStep;
      }
      
      updatedContext[currentState.currentStep] = {
        buttonId: message.selectedButtonId,
        buttonTitle: selectedButton?.title,
      };
    } else if (currentTemplate.messageType === "list" && message.selectedListItemId) {
      const listSections = currentTemplate.listSections as any[];
      let selectedItem: any = null;
      
      for (const section of listSections || []) {
        selectedItem = section.rows?.find((row: any) => row.id === message.selectedListItemId);
        if (selectedItem) break;
      }
      
      if (currentState.currentStep === "language_select") {
        if (message.selectedListItemId === "en" || message.selectedListItemId === "english") {
          language = "en";
        } else if (message.selectedListItemId === "hi" || message.selectedListItemId === "hindi") {
          language = "hi";
        }
        nextStep = this.getNextStepAfterLanguage(currentState.flowType);
      } else if (selectedItem?.nextStep) {
        nextStep = selectedItem.nextStep;
      }
      
      updatedContext[currentState.currentStep] = {
        itemId: message.selectedListItemId,
        itemTitle: selectedItem?.title,
      };
    } else if (currentTemplate.messageType === "text") {
      updatedContext[currentState.currentStep] = {
        text: message.content,
      };
      
      if (currentState.currentStep === "language_select") {
        const lowerContent = message.content.toLowerCase();
        if (lowerContent.includes("hindi") || lowerContent.includes("हिंदी")) {
          language = "hi";
          nextStep = this.getNextStepAfterLanguage(currentState.flowType);
        } else if (lowerContent.includes("english") || lowerContent.includes("अंग्रेजी")) {
          language = "en";
          nextStep = this.getNextStepAfterLanguage(currentState.flowType);
        }
      } else {
        nextStep = this.getDefaultNextStep(currentState.flowType, currentState.currentStep);
      }
    }

    // If conversation is completing, create the appropriate record
    if (nextStep === "complete") {
      await this.createRecordFromConversation(currentState, updatedContext);
    }

    const updatedState = await storage.updateConversationState(currentState.customerPhone, {
      currentStep: nextStep,
      language,
      context: updatedContext,
    });

    return updatedState;
  }

  private async createRecordFromConversation(
    state: ConversationState,
    context: any
  ): Promise<void> {
    try {
      if (state.flowType === "campaign_lead") {
        // Extract survey time selection
        const surveySelection = context.survey_schedule?.itemId || context.survey_schedule?.buttonId;
        let preferredSurveyDate = null;
        let preferredSurveyTime = null;

        if (surveySelection) {
          // Parse survey slot (e.g., "morning_9-11" -> "9 AM - 11 AM")
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          preferredSurveyDate = tomorrow.toISOString().split('T')[0];

          if (surveySelection.includes('morning_9-11')) {
            preferredSurveyTime = "9 AM - 11 AM";
          } else if (surveySelection.includes('morning_11-1')) {
            preferredSurveyTime = "11 AM - 1 PM";
          } else if (surveySelection.includes('afternoon_2-4')) {
            preferredSurveyTime = "2 PM - 4 PM";
          } else if (surveySelection.includes('afternoon_4-6')) {
            preferredSurveyTime = "4 PM - 6 PM";
          }
        }

        await storage.createLead({
          customerPhone: state.customerPhone,
          customerName: state.customerName || "Customer",
          interestedIn: "Solar Installation",
          preferredSurveyDate,
          preferredSurveyTime,
          notes: `Lead from WhatsApp campaign. Language: ${state.language || 'not specified'}`,
        });

        console.log(`Created lead for ${state.customerPhone}`);
      } else if (state.flowType === "service_request") {
        // Extract service details
        const serviceType = context.service_menu?.itemId;
        const problemDescription = context.problem_description?.text || "Not provided";
        const urgencySelection = context.urgency_select?.buttonId;

        let issueType = "Other";
        if (serviceType === "installation") {
          issueType = "Installation";
        } else if (serviceType === "maintenance" || serviceType === "repair") {
          issueType = "Service-Repair";
        }

        let urgency = "medium";
        if (urgencySelection === "high") {
          urgency = "high";
        } else if (urgencySelection === "low") {
          urgency = "low";
        }

        await storage.createServiceRequest({
          customerPhone: state.customerPhone,
          customerName: state.customerName || "Customer",
          issueType,
          description: problemDescription,
          urgency,
          status: "pending",
          customerVillage: null,
          assignedTo: null,
        });

        console.log(`Created service request for ${state.customerPhone}`);
      }
    } catch (error) {
      console.error("Error creating record from conversation:", error);
    }
  }

  private getNextStepAfterLanguage(flowType: string): string {
    return flowType === "campaign_lead" ? "offer" : "service_menu";
  }

  private getDefaultNextStep(flowType: string, currentStep: string): string {
    if (flowType === "campaign_lead") {
      const campaignFlow: Record<string, string> = {
        language_select: "offer",
        offer: "survey_schedule",
        survey_schedule: "complete",
      };
      return campaignFlow[currentStep] || "complete";
    } else {
      const serviceFlow: Record<string, string> = {
        language_select: "service_menu",
        service_menu: "problem_description",
        problem_description: "urgency_select",
        urgency_select: "complete",
      };
      return serviceFlow[currentStep] || "complete";
    }
  }

  private async resolveNextTemplate(state: ConversationState): Promise<MessageTemplate | undefined> {
    if (state.currentStep === "complete") {
      return undefined;
    }

    const templates = await storage.getMessageTemplates(
      state.flowType,
      state.language || undefined,
      state.currentStep
    );

    return templates[0];
  }

  async startNewConversation(
    customerPhone: string,
    customerName: string,
    flowType: "campaign_lead" | "service_request"
  ): Promise<OutgoingMessage> {
    const existingState = await storage.getConversationState(customerPhone);
    
    if (existingState) {
      await storage.deleteConversationState(customerPhone);
    }

    const newState = await storage.createConversationState({
      customerPhone,
      customerName,
      flowType,
      currentStep: "language_select",
      language: null,
      context: {},
    });

    const firstTemplate = await this.resolveNextTemplate(newState);

    if (!firstTemplate) {
      return {
        template: null as any,
        shouldSend: false,
        error: "No template found for language selection",
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
