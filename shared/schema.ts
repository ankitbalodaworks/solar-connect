import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  electricityConsumption: integer("electricity_consumption").notNull(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  interestedIn: text("interested_in").notNull(),
  preferredSurveyDate: text("preferred_survey_date"),
  preferredSurveyTime: text("preferred_survey_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const serviceRequests = pgTable("service_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerVillage: text("customer_village"),
  issueType: text("issue_type").notNull(),
  description: text("description"),
  urgency: text("urgency").notNull().default("medium"),
  assignedTo: text("assigned_to"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  message: text("message").notNull(),
  threshold: integer("threshold").notNull(),
  recipientCount: integer("recipient_count").notNull(),
  sentCount: integer("sent_count").notNull().default(0),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const messageTemplates = pgTable("message_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  flowType: text("flow_type").notNull(), // 'campaign_lead' or 'service_request'
  stepKey: text("step_key").notNull(), // Unique identifier like 'language_select', 'offer', 'date_select'
  messageType: text("message_type").notNull(), // 'button' or 'list' or 'text'
  language: text("language").notNull(), // 'en' or 'hi'
  bodyText: text("body_text").notNull(),
  headerText: text("header_text"),
  headerMediaId: text("header_media_id"), // WhatsApp media ID for image headers
  footerText: text("footer_text"),
  buttons: jsonb("buttons"), // Array of button objects {id, title, nextStep}
  listSections: jsonb("list_sections"), // Array of list section objects
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
}, (table) => ({
  uniqueTemplate: unique().on(table.flowType, table.language, table.stepKey),
}));

export const conversationStates = pgTable("conversation_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPhone: text("customer_phone").notNull().unique(),
  customerName: text("customer_name"),
  flowType: text("flow_type").notNull(), // 'campaign_lead' or 'service_request'
  currentStep: text("current_step").notNull(),
  language: text("language"), // 'en' or 'hi'
  context: jsonb("context"), // Store conversation context data
  lastMessageAt: timestamp("last_message_at").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const whatsappLogs = pgTable("whatsapp_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPhone: text("customer_phone").notNull(),
  direction: text("direction").notNull(), // 'outbound' or 'inbound'
  messageType: text("message_type").notNull(), // 'text', 'button', 'list', etc.
  content: jsonb("content").notNull(), // Full message payload
  status: text("status"), // 'sent', 'delivered', 'read', 'failed'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertServiceRequestSchema = createInsertSchema(serviceRequests).omit({ id: true, createdAt: true });
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ id: true, createdAt: true });
export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({ id: true, createdAt: true });
export const insertConversationStateSchema = createInsertSchema(conversationStates).omit({ id: true, createdAt: true, lastMessageAt: true });
export const insertWhatsappLogSchema = createInsertSchema(whatsappLogs).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type ConversationState = typeof conversationStates.$inferSelect;
export type InsertConversationState = z.infer<typeof insertConversationStateSchema>;
export type WhatsappLog = typeof whatsappLogs.$inferSelect;
export type InsertWhatsappLog = z.infer<typeof insertWhatsappLogSchema>;
