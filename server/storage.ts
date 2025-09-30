import { type User, type InsertUser, type MessageTemplate, type InsertMessageTemplate, type ConversationState, type InsertConversationState, type WhatsappLog, type InsertWhatsappLog, type Lead, type InsertLead, type ServiceRequest, type InsertServiceRequest } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { messageTemplates, conversationStates, whatsappLogs, leads, serviceRequests } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

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
}

export const storage = new MemStorage();
