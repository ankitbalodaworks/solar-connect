import { db } from "../server/db";
import { messageTemplates } from "../shared/schema";
import { sql } from "drizzle-orm";

// Seed message templates for WhatsApp conversation flows
async function seedTemplates() {
  console.log("🌱 Starting template seed...");

  try {
    // Campaign Entry Template - Trust-first (SP_CAMPAIGN_TRUST_V1)
    const campaignEntry = {
      name: "SP_CAMPAIGN_TRUST_V1",
      flowType: "campaign",
      stepKey: "campaign_entry",
      messageType: "button",
      language: "en",
      bodyText: "Hello,\n\nWe are a PM Surya Ghar registered vendor and Class-B Electrical Contractor. We use ALMM/BIS-compliant modules.\n\n(Subsidy as per portal; subject to eligibility & updates.)\n\nTo Continue, Choose:",
      headerMediaId: "4245254242364293",
      footerText: "Licensed PM Surya Ghar Solar Vendor",
      buttons: [
        { id: "hindi", title: "हिंदी", nextStep: "main_menu" },
        { id: "english", title: "English", nextStep: "main_menu" },
        { id: "visit_website", title: "Visit Website", nextStep: null }
      ],
      metaStatus: "draft"
    };

    console.log("📝 Inserting campaign_entry template (SP_CAMPAIGN_TRUST_V1)...");
    await db.insert(messageTemplates)
      .values(campaignEntry)
      .onConflictDoUpdate({
        target: [messageTemplates.flowType, messageTemplates.language, messageTemplates.stepKey],
        set: campaignEntry
      });

    // Main Menu - English (SP_MAIN_EN_TRIO_V1)
    const mainMenuEn = {
      name: "SP_MAIN_EN_TRIO_V1",
      flowType: "campaign",
      stepKey: "main_menu",
      messageType: "button",
      language: "en",
      headerText: "Main Menu",
      bodyText: "Thank you for choosing us! What would you like to do?",
      footerText: "Sunshine Power - Your Trusted Solar Partner",
      buttons: [
        { id: "book_site_survey", title: "Book Site Survey", nextStep: null },
        { id: "request_callback", title: "Request Callback", nextStep: null },
        { id: "why_sunshine_power", title: "Why Sunshine Power?", nextStep: null }
      ],
      metaStatus: "draft"
    };

    console.log("📝 Inserting main_menu_en template (SP_MAIN_EN_TRIO_V1)...");
    await db.insert(messageTemplates)
      .values(mainMenuEn)
      .onConflictDoUpdate({
        target: [messageTemplates.flowType, messageTemplates.language, messageTemplates.stepKey],
        set: mainMenuEn
      });

    // Main Menu - Hindi (SP_MAIN_HI_TRIO_V1)
    const mainMenuHi = {
      name: "SP_MAIN_HI_TRIO_V1",
      flowType: "campaign",
      stepKey: "main_menu",
      messageType: "button",
      language: "hi",
      headerText: "मुख्य मेनू",
      bodyText: "हमें चुनने के लिए धन्यवाद! आप क्या करना चाहेंगे?",
      footerText: "Sunshine Power - आपका विश्वसनीय सोलर पार्टनर",
      buttons: [
        { id: "book_site_survey", title: "साइट सर्वे बुक करें", nextStep: null },
        { id: "request_callback", title: "कॉलबैक का अनुरोध करें", nextStep: null },
        { id: "why_sunshine_power", title: "Sunshine Power क्यों?", nextStep: null }
      ],
      metaStatus: "draft"
    };

    console.log("📝 Inserting main_menu_hi template (SP_MAIN_HI_TRIO_V1)...");
    await db.insert(messageTemplates)
      .values(mainMenuHi)
      .onConflictDoUpdate({
        target: [messageTemplates.flowType, messageTemplates.language, messageTemplates.stepKey],
        set: mainMenuHi
      });

    // Help Submenu - English
    const helpSubmenuEn = {
      name: "sunshine_help_submenu_en",
      flowType: "campaign",
      stepKey: "help_submenu",
      messageType: "button",
      language: "en",
      headerText: "Help & Support",
      bodyText: "We are here to help you!\n\nPlease select what you need:",
      footerText: "Sunshine Power",
      buttons: [
        { id: "maintenance", title: "Maintenance request", nextStep: null },
        { id: "callback", title: "Request callback", nextStep: null },
        { id: "other_issue", title: "Register issue", nextStep: null }
      ],
      metaStatus: "approved"
    };

    console.log("📝 Inserting help_submenu_en template...");
    await db.insert(messageTemplates)
      .values(helpSubmenuEn)
      .onConflictDoUpdate({
        target: [messageTemplates.flowType, messageTemplates.language, messageTemplates.stepKey],
        set: helpSubmenuEn
      });

    // Help Submenu - Hindi
    const helpSubmenuHi = {
      name: "sunshine_help_submenu_hi",
      flowType: "campaign",
      stepKey: "help_submenu",
      messageType: "button",
      language: "hi",
      headerText: "सहायता और समर्थन",
      bodyText: "हम आपकी मदद के लिए यहां हैं!\n\nकृपया चुनें आपको क्या चाहिए:",
      footerText: "Sunshine Power",
      buttons: [
        { id: "maintenance", title: "रखरखाव अनुरोध", nextStep: null },
        { id: "callback", title: "कॉलबैक का अनुरोध", nextStep: null },
        { id: "other_issue", title: "समस्या दर्ज करें", nextStep: null }
      ],
      metaStatus: "approved"
    };

    console.log("📝 Inserting help_submenu_hi template...");
    await db.insert(messageTemplates)
      .values(helpSubmenuHi)
      .onConflictDoUpdate({
        target: [messageTemplates.flowType, messageTemplates.language, messageTemplates.stepKey],
        set: helpSubmenuHi
      });

    // QR Survey Template - English Only (sp_qr_english_survey_v1)
    const qrEnglishSurvey = {
      name: "sp_qr_english_survey_v1",
      flowType: "qr_survey",
      stepKey: "qr_survey",
      messageType: "button",
      language: "en",
      headerText: "Site Survey Visit Request",
      bodyText: "Thank you for your interest in solar power! We're here to help you get started with a free site survey.\n\nClick below to book your visit:",
      footerText: "PM Surya Ghar Registered Solar Vendor",
      buttons: [
        { 
          type: "FLOW", 
          text: "Book Site Survey", 
          flow_id: "1339797841199667",
          flow_action: "navigate"
        }
      ],
      metaStatus: "draft"
    };

    console.log("📝 Inserting qr_english_survey template (sp_qr_english_survey_v1)...");
    await db.insert(messageTemplates)
      .values(qrEnglishSurvey)
      .onConflictDoUpdate({
        target: [messageTemplates.flowType, messageTemplates.language, messageTemplates.stepKey],
        set: qrEnglishSurvey
      });

    console.log("✅ Template seed completed successfully!");
    console.log("\nTemplates loaded:");
    console.log("  - Campaign Entry (with image header, 3 buttons)");
    console.log("  - Main Menu English (3 buttons)");
    console.log("  - Main Menu Hindi (3 buttons)");
    console.log("  - Help Submenu English (3 buttons)");
    console.log("  - Help Submenu Hindi (3 buttons)");
    console.log("  - QR English Survey (1 FLOW button - Direct to EN)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    process.exit(1);
  }
}

seedTemplates();
