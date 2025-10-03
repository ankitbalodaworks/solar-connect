import { type User, type InsertUser, type MessageTemplate, type InsertMessageTemplate, type ConversationState, type InsertConversationState, type WhatsappLog, type InsertWhatsappLog, type Lead, type InsertLead, type ServiceRequest, type InsertServiceRequest, type CallbackRequest, type InsertCallbackRequest, type PriceEstimate, type InsertPriceEstimate, type OtherIssue, type InsertOtherIssue, type Event, type InsertEvent, type Form, type InsertForm } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { messageTemplates, conversationStates, whatsappLogs, leads, serviceRequests, customers, campaigns, callbackRequests, priceEstimates, otherIssues, events, forms } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Message Templates
  getMessageTemplates(flowType?: string, language?: string, stepKey?: string): Promise<MessageTemplate[]>;
  getMessageTemplate(id: string): Promise<MessageTemplate | undefined>;
  createMessageTemplate(template: InsertMessageTemplate): Promise<MessageTemplate>;
  updateMessageTemplate(id: string, template: Partial<InsertMessageTemplate>): Promise<MessageTemplate | undefined>;
  deleteMessageTemplate(id: string): Promise<boolean>;

  // Conversation States
  getConversationStates(customerPhone?: string): Promise<ConversationState[]>;
  getConversationState(customerPhone: string): Promise<ConversationState | undefined>;
  createConversationState(state: InsertConversationState): Promise<ConversationState>;
  updateConversationState(customerPhone: string, state: Partial<InsertConversationState>): Promise<ConversationState | undefined>;
  deleteConversationState(customerPhone: string): Promise<boolean>;

  // WhatsApp Logs
  createWhatsappLog(log: InsertWhatsappLog): Promise<WhatsappLog>;
  getWhatsappLogs(customerPhone?: string, limit?: number): Promise<WhatsappLog[]>;

  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;

  // Service Requests
  getServiceRequests(): Promise<ServiceRequest[]>;
  getServiceRequest(id: string): Promise<ServiceRequest | undefined>;
  createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: string, request: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined>;
  deleteServiceRequest(id: string): Promise<boolean>;

  // Callback Requests
  getCallbackRequests(): Promise<CallbackRequest[]>;
  getCallbackRequest(id: string): Promise<CallbackRequest | undefined>;
  createCallbackRequest(request: InsertCallbackRequest): Promise<CallbackRequest>;
  updateCallbackRequest(id: string, request: Partial<InsertCallbackRequest>): Promise<CallbackRequest | undefined>;
  deleteCallbackRequest(id: string): Promise<boolean>;

  // Price Estimates
  getPriceEstimates(): Promise<PriceEstimate[]>;
  getPriceEstimate(id: string): Promise<PriceEstimate | undefined>;
  createPriceEstimate(estimate: InsertPriceEstimate): Promise<PriceEstimate>;
  updatePriceEstimate(id: string, estimate: Partial<InsertPriceEstimate>): Promise<PriceEstimate | undefined>;
  deletePriceEstimate(id: string): Promise<boolean>;

  // Other Issues
  getOtherIssues(): Promise<OtherIssue[]>;
  getOtherIssue(id: string): Promise<OtherIssue | undefined>;
  createOtherIssue(issue: InsertOtherIssue): Promise<OtherIssue>;
  updateOtherIssue(id: string, issue: Partial<InsertOtherIssue>): Promise<OtherIssue | undefined>;
  deleteOtherIssue(id: string): Promise<boolean>;

  // Events (for status tracking)
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(customerPhone?: string, limit?: number): Promise<Event[]>;
  getLatestEventByPhone(customerPhone: string): Promise<Event | undefined>;

  // Forms (submitted form data)
  createForm(form: InsertForm): Promise<Form>;
  getForms(customerPhone?: string): Promise<Form[]>;
  getForm(id: string): Promise<Form | undefined>;

  // Contact Status Summary (for Status Page)
  getContactStatusSummary(): Promise<Array<{
    customerPhone: string;
    latestEventType: string | null;
    latestEventTimestamp: Date | null;
    formCount: number;
  }>>;

  // Statistics
  getStatistics(): Promise<{
    totalCustomers: number;
    totalCampaigns: number;
    totalLeads: number;
    totalServiceRequests: number;
    activeConversations: number;
  }>;

  // Clear all test data
  clearAllData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Message Templates - Database-backed
  async getMessageTemplates(flowType?: string, language?: string, stepKey?: string): Promise<MessageTemplate[]> {
    const conditions = [];
    if (flowType) conditions.push(eq(messageTemplates.flowType, flowType));
    if (language) conditions.push(eq(messageTemplates.language, language));
    if (stepKey) conditions.push(eq(messageTemplates.stepKey, stepKey));

    if (conditions.length === 0) {
      return await db.select().from(messageTemplates);
    }

    if (conditions.length === 1) {
      return await db.select().from(messageTemplates).where(conditions[0]);
    }

    return await db.select().from(messageTemplates).where(and(...conditions));
  }

  async getMessageTemplate(id: string): Promise<MessageTemplate | undefined> {
    const result = await db.select().from(messageTemplates).where(eq(messageTemplates.id, id));
    return result[0];
  }

  async createMessageTemplate(template: InsertMessageTemplate): Promise<MessageTemplate> {
    const result = await db.insert(messageTemplates).values(template).returning();
    return result[0];
  }

  async updateMessageTemplate(id: string, template: Partial<InsertMessageTemplate>): Promise<MessageTemplate | undefined> {
    const result = await db.update(messageTemplates)
      .set(template)
      .where(eq(messageTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteMessageTemplate(id: string): Promise<boolean> {
    const result = await db.delete(messageTemplates).where(eq(messageTemplates.id, id)).returning();
    return result.length > 0;
  }

  // Conversation States - Database-backed
  async getConversationStates(customerPhone?: string): Promise<ConversationState[]> {
    if (customerPhone) {
      return await db.select().from(conversationStates)
        .where(eq(conversationStates.customerPhone, customerPhone))
        .orderBy(desc(conversationStates.lastMessageAt));
    }
    return await db.select().from(conversationStates)
      .orderBy(desc(conversationStates.lastMessageAt));
  }

  async getConversationState(customerPhone: string): Promise<ConversationState | undefined> {
    const result = await db.select().from(conversationStates).where(eq(conversationStates.customerPhone, customerPhone));
    return result[0];
  }

  async createConversationState(state: InsertConversationState): Promise<ConversationState> {
    const result = await db.insert(conversationStates).values(state).returning();
    return result[0];
  }

  async updateConversationState(customerPhone: string, state: Partial<InsertConversationState>): Promise<ConversationState | undefined> {
    const result = await db.update(conversationStates)
      .set({ ...state, lastMessageAt: new Date() })
      .where(eq(conversationStates.customerPhone, customerPhone))
      .returning();
    return result[0];
  }

  async deleteConversationState(customerPhone: string): Promise<boolean> {
    const result = await db.delete(conversationStates).where(eq(conversationStates.customerPhone, customerPhone)).returning();
    return result.length > 0;
  }

  // WhatsApp Logs - Database-backed
  async createWhatsappLog(log: InsertWhatsappLog): Promise<WhatsappLog> {
    const result = await db.insert(whatsappLogs).values(log).returning();
    return result[0];
  }

  async getWhatsappLogs(customerPhone?: string, limit: number = 50): Promise<WhatsappLog[]> {
    if (customerPhone) {
      return await db.select().from(whatsappLogs)
        .where(eq(whatsappLogs.customerPhone, customerPhone))
        .orderBy(desc(whatsappLogs.createdAt))
        .limit(limit);
    }
    return await db.select().from(whatsappLogs)
      .orderBy(desc(whatsappLogs.createdAt))
      .limit(limit);
  }

  // Leads - Database-backed
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id));
    return result[0];
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }

  async updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined> {
    const result = await db.update(leads)
      .set(lead)
      .where(eq(leads.id, id))
      .returning();
    return result[0];
  }

  async deleteLead(id: string): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning();
    return result.length > 0;
  }

  // Service Requests - Database-backed
  async getServiceRequests(): Promise<ServiceRequest[]> {
    return await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
  }

  async getServiceRequest(id: string): Promise<ServiceRequest | undefined> {
    const result = await db.select().from(serviceRequests).where(eq(serviceRequests.id, id));
    return result[0];
  }

  async createServiceRequest(request: InsertServiceRequest): Promise<ServiceRequest> {
    const result = await db.insert(serviceRequests).values(request).returning();
    return result[0];
  }

  async updateServiceRequest(id: string, request: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined> {
    const result = await db.update(serviceRequests)
      .set(request)
      .where(eq(serviceRequests.id, id))
      .returning();
    return result[0];
  }

  async deleteServiceRequest(id: string): Promise<boolean> {
    const result = await db.delete(serviceRequests).where(eq(serviceRequests.id, id)).returning();
    return result.length > 0;
  }

  // Callback Requests - Database-backed
  async getCallbackRequests(): Promise<CallbackRequest[]> {
    return await db.select().from(callbackRequests).orderBy(desc(callbackRequests.createdAt));
  }

  async getCallbackRequest(id: string): Promise<CallbackRequest | undefined> {
    const result = await db.select().from(callbackRequests).where(eq(callbackRequests.id, id));
    return result[0];
  }

  async createCallbackRequest(request: InsertCallbackRequest): Promise<CallbackRequest> {
    const result = await db.insert(callbackRequests).values(request).returning();
    return result[0];
  }

  async updateCallbackRequest(id: string, request: Partial<InsertCallbackRequest>): Promise<CallbackRequest | undefined> {
    const result = await db.update(callbackRequests)
      .set(request)
      .where(eq(callbackRequests.id, id))
      .returning();
    return result[0];
  }

  async deleteCallbackRequest(id: string): Promise<boolean> {
    const result = await db.delete(callbackRequests).where(eq(callbackRequests.id, id)).returning();
    return result.length > 0;
  }

  // Price Estimates - Database-backed
  async getPriceEstimates(): Promise<PriceEstimate[]> {
    return await db.select().from(priceEstimates).orderBy(desc(priceEstimates.createdAt));
  }

  async getPriceEstimate(id: string): Promise<PriceEstimate | undefined> {
    const result = await db.select().from(priceEstimates).where(eq(priceEstimates.id, id));
    return result[0];
  }

  async createPriceEstimate(estimate: InsertPriceEstimate): Promise<PriceEstimate> {
    const result = await db.insert(priceEstimates).values(estimate).returning();
    return result[0];
  }

  async updatePriceEstimate(id: string, estimate: Partial<InsertPriceEstimate>): Promise<PriceEstimate | undefined> {
    const result = await db.update(priceEstimates)
      .set(estimate)
      .where(eq(priceEstimates.id, id))
      .returning();
    return result[0];
  }

  async deletePriceEstimate(id: string): Promise<boolean> {
    const result = await db.delete(priceEstimates).where(eq(priceEstimates.id, id)).returning();
    return result.length > 0;
  }

  // Other Issues - Database-backed
  async getOtherIssues(): Promise<OtherIssue[]> {
    return await db.select().from(otherIssues).orderBy(desc(otherIssues.createdAt));
  }

  async getOtherIssue(id: string): Promise<OtherIssue | undefined> {
    const result = await db.select().from(otherIssues).where(eq(otherIssues.id, id));
    return result[0];
  }

  async createOtherIssue(issue: InsertOtherIssue): Promise<OtherIssue> {
    const result = await db.insert(otherIssues).values(issue).returning();
    return result[0];
  }

  async updateOtherIssue(id: string, issue: Partial<InsertOtherIssue>): Promise<OtherIssue | undefined> {
    const result = await db.update(otherIssues)
      .set(issue)
      .where(eq(otherIssues.id, id))
      .returning();
    return result[0];
  }

  async deleteOtherIssue(id: string): Promise<boolean> {
    const result = await db.delete(otherIssues).where(eq(otherIssues.id, id)).returning();
    return result.length > 0;
  }

  // Events (for status tracking)
  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async getEvents(customerPhone?: string, limit?: number): Promise<Event[]> {
    let query = db.select().from(events).orderBy(desc(events.createdAt));

    if (customerPhone) {
      query = query.where(eq(events.customerPhone, customerPhone)) as any;
    }

    if (limit) {
      query = query.limit(limit) as any;
    }

    return await query;
  }

  async getLatestEventByPhone(customerPhone: string): Promise<Event | undefined> {
    const result = await db.select()
      .from(events)
      .where(eq(events.customerPhone, customerPhone))
      .orderBy(desc(events.createdAt))
      .limit(1);
    return result[0];
  }

  async getContactStatusSummary(): Promise<Array<{
    customerPhone: string;
    latestEventType: string | null;
    latestEventTimestamp: Date | null;
    formCount: number;
  }>> {
    // Get all unique customer phones from events (since we don't have a customers table populated yet)
    // Start from events but include all contacts
    const result = await db.execute(sql`
      WITH all_phones AS (
        SELECT DISTINCT customer_phone FROM events
      ),
      latest_events AS (
        SELECT DISTINCT ON (customer_phone) 
          customer_phone,
          type,
          created_at
        FROM events
        ORDER BY customer_phone, created_at DESC
      ),
      form_counts AS (
        SELECT customer_phone, COUNT(*) as count
        FROM forms
        GROUP BY customer_phone
      )
      SELECT 
        ap.customer_phone,
        le.type as latest_event_type,
        le.created_at as latest_event_timestamp,
        COALESCE(fc.count, 0) as form_count
      FROM all_phones ap
      LEFT JOIN latest_events le ON ap.customer_phone = le.customer_phone
      LEFT JOIN form_counts fc ON ap.customer_phone = fc.customer_phone
      ORDER BY COALESCE(le.created_at, CURRENT_TIMESTAMP) DESC
    `);

    return (result.rows as any[]).map(row => ({
      customerPhone: row.customer_phone,
      latestEventType: row.latest_event_type || null,
      latestEventTimestamp: row.latest_event_timestamp ? new Date(row.latest_event_timestamp) : null,
      formCount: Number(row.form_count || 0),
    }));
  }

  // Forms (submitted form data)
  async createForm(form: InsertForm): Promise<Form> {
    const result = await db.insert(forms).values(form).returning();
    return result[0];
  }

  async getForms(customerPhone?: string): Promise<Form[]> {
    if (customerPhone) {
      return await db.select()
        .from(forms)
        .where(eq(forms.customerPhone, customerPhone))
        .orderBy(desc(forms.submittedAt));
    }
    return await db.select().from(forms).orderBy(desc(forms.submittedAt));
  }

  async getForm(id: string): Promise<Form | undefined> {
    const result = await db.select().from(forms).where(eq(forms.id, id));
    return result[0];
  }

  // Statistics
  async getStatistics(): Promise<{
    totalCustomers: number;
    totalCampaigns: number;
    totalLeads: number;
    totalServiceRequests: number;
    activeConversations: number;
  }> {
    const customersData = await db.select().from(customers);
    const campaignsData = await db.select().from(campaigns);
    const leadsData = await db.select().from(leads);
    const serviceRequestsData = await db.select().from(serviceRequests);
    const conversationsData = await db.select().from(conversationStates);

    return {
      totalCustomers: customersData.length,
      totalCampaigns: campaignsData.length,
      totalLeads: leadsData.length,
      totalServiceRequests: serviceRequestsData.length,
      activeConversations: conversationsData.length,
    };
  }

  // Clear all test data
  async clearAllData(): Promise<void> {
    await db.delete(whatsappLogs);
    await db.delete(conversationStates);
    await db.delete(serviceRequests);
    await db.delete(leads);
  }
}

export const storage = new MemStorage();

// Message Templates data
// Note: This should be part of your database seeding or initialization logic
// and not hardcoded directly in the storage class if the database is persistent.
// For a purely in-memory storage or for demonstration purposes, it can be here.

// Add message templates to the database on startup if they don't exist
async function seedMessageTemplates() {
  const existingTemplates = await db.select().from(messageTemplates);
  if (existingTemplates.length > 0) {
    return; // Skip seeding if templates already exist
  }

  await db.insert(messageTemplates).values([
    // Campaign Entry Point
    {
      flowType: "campaign",
      stepKey: "campaign_entry",
      stepName: "Campaign Entry - Language Selection",
      language: null,
      messageType: "button",
      bodyText: "🌞 Welcome to Sunshine Power!\n\nWe help rural Rajasthan save money with solar energy under PM Surya Ghar Yojana.\n\n🌞 सनशाइन पावर में आपका स्वागत है!\n\nहम PM सूर्य घर योजना के तहत ग्रामीण राजस्थान को सोलर ऊर्जा से पैसे बचाने में मदद करते हैं।\n\nPlease choose your language / कृपया अपनी भाषा चुनें:",
      headerText: null,
      footerText: "Reply 'W' for website / वेबसाइट के लिए 'W' टाइप करें",
      buttons: [
        { id: "english", title: "English" },
        { id: "hindi", title: "हिंदी" }
      ],
      listSections: null,
      headerMediaId: null,
      name: "Campaign Entry",
    },
    // Main Menu (English)
    {
      flowType: "campaign",
      stepKey: "main_menu",
      stepName: "Main Menu",
      language: "en",
      messageType: "button",
      bodyText: "How can we help you with solar energy today?",
      headerText: "Main Menu",
      footerText: "PM Surya Ghar Registered Vendor",
      buttons: [
        { id: "site_survey", title: "Book Site Survey" },
        { id: "price_info", title: "Price & Info" },
        { id: "service_support", title: "Service & Support" }
      ],
      listSections: null,
      headerMediaId: null,
      name: "Main Menu (English)",
    },
    // Main Menu (Hindi)
    {
      flowType: "campaign",
      stepKey: "main_menu",
      stepName: "Main Menu",
      language: "hi",
      messageType: "button",
      bodyText: "आज हम सोलर ऊर्जा में आपकी कैसे मदद कर सकते हैं?",
      headerText: "मुख्य मेनू",
      footerText: "PM Surya Ghar पंजीकृत विक्रेता",
      buttons: [
        { id: "site_survey", title: "साइट सर्वे बुक करें" },
        { id: "price_info", title: "मूल्य और जानकारी" },
        { id: "service_support", title: "सेवा और सहायता" }
      ],
      listSections: null,
      headerMediaId: null,
      name: "Main Menu (Hindi)",
    },
    
  ]);
}

// Call the seed function when the module is loaded
// In a real application, this might be called during application startup
seedMessageTemplates().catch(console.error);