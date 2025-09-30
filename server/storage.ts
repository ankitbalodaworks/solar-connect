import { type User, type InsertUser, type MessageTemplate, type InsertMessageTemplate } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { messageTemplates } from "@shared/schema";
import { eq, and } from "drizzle-orm";

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
}

export const storage = new MemStorage();
