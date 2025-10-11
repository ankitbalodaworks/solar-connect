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
  address: text("address"),
  village: text("village"),
  interestedIn: text("interested_in").notNull(),
  avgBill: integer("avg_bill"),
  phase: text("phase"),
  roofType: text("roof_type"),
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
  address: text("address"),
  customerVillage: text("customer_village"),
  issueType: text("issue_type").notNull(),
  description: text("description"),
  urgency: text("urgency").notNull().default("medium"),
  preferredDate: text("preferred_date"),
  preferredTime: text("preferred_time"),
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
  metaTemplateId: text("meta_template_id"), // ID returned by Meta after submission
  metaStatus: text("meta_status").notNull().default("draft"), // 'draft', 'pending', 'approved', 'rejected'
  metaStatusUpdatedAt: timestamp("meta_status_updated_at"),
  submissionError: text("submission_error"), // Error message if submission/approval failed
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

export const callbackRequests = pgTable("callback_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  bestTime: text("best_time"),
  topic: text("topic"),
  notes: text("notes"),
  source: text("source").notNull(), // 'price_inquiry' or 'help_request'
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const priceEstimates = pgTable("price_estimates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  address: text("address"),
  village: text("village"),
  avgBill: integer("avg_bill"),
  monthlyUnits: integer("monthly_units"),
  phase: text("phase"),
  roofType: text("roof_type"),
  status: text("status").notNull().default("pending"),
  estimatedCost: integer("estimated_cost"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const otherIssues = pgTable("other_issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address"),
  customerVillage: text("customer_village"),
  issueDescription: text("issue_description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPhone: text("customer_phone").notNull(), // Using phone as customer identifier
  type: text("type").notNull(), // campaign_sent, delivered, read, replied, language_selected_hi/en, menu_site_survey, etc.
  meta: jsonb("meta"), // Store payload fragments like message_id, button id, flow screen, language, etc.
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const forms = pgTable("forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerPhone: text("customer_phone").notNull(), // Using phone as customer identifier
  formType: text("form_type").notNull(), // site_survey, price_estimate, service_request, callback, other_issue
  data: jsonb("data").notNull(), // Full submission data
  submittedAt: timestamp("submitted_at").notNull().default(sql`now()`),
});

// WhatsApp Flow Management Table - Tracks flow IDs and versions from Meta
export const whatsappFlows = pgTable("whatsapp_flows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flowKey: text("flow_key").notNull().unique(), // e.g., "survey_en", "callback_hi"
  flowType: text("flow_type").notNull(), // 'survey', 'callback', 'trust', 'eligibility', 'price', 'service'
  language: text("language").notNull(), // 'en' or 'hi'
  metaFlowId: text("meta_flow_id"), // ID returned by Meta after creation
  flowName: text("flow_name").notNull(), // Human-readable name for WhatsApp Manager
  flowJson: jsonb("flow_json").notNull(), // Complete flow JSON definition
  categories: jsonb("categories"), // Flow categories like APPOINTMENT_BOOKING, LEAD_GENERATION
  status: text("status").notNull().default("draft"), // 'draft', 'published', 'deprecated', 'error'
  version: integer("version").notNull().default(1),
  errorMessage: text("error_message"), // Error details if creation/update failed
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => ({
  uniqueFlowType: unique().on(table.flowType, table.language),
}));

export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignName: text("campaign_name").notNull(),
  message: text("message").notNull(),
  phoneNumber: text("phone_number").notNull(),
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
export const insertCallbackRequestSchema = createInsertSchema(callbackRequests).omit({ id: true, createdAt: true });
export const insertPriceEstimateSchema = createInsertSchema(priceEstimates).omit({ id: true, createdAt: true });
export const insertOtherIssueSchema = createInsertSchema(otherIssues).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertFormSchema = createInsertSchema(forms).omit({ id: true, submittedAt: true });
export const insertWhatsappFlowSchema = createInsertSchema(whatsappFlows).omit({ id: true, createdAt: true, updatedAt: true });
export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({ id: true, createdAt: true });

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
export type CallbackRequest = typeof callbackRequests.$inferSelect;
export type InsertCallbackRequest = z.infer<typeof insertCallbackRequestSchema>;
export type PriceEstimate = typeof priceEstimates.$inferSelect;
export type InsertPriceEstimate = z.infer<typeof insertPriceEstimateSchema>;
export type OtherIssue = typeof otherIssues.$inferSelect;
export type InsertOtherIssue = z.infer<typeof insertOtherIssueSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Form = typeof forms.$inferSelect;
export type InsertForm = z.infer<typeof insertFormSchema>;
export type WhatsappFlow = typeof whatsappFlows.$inferSelect;
export type InsertWhatsappFlow = z.infer<typeof insertWhatsappFlowSchema>;
export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = z.infer<typeof insertQrCodeSchema>;
