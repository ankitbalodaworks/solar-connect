import { db } from "../server/db";
import { messageTemplates } from "../shared/schema";
import { sql } from "drizzle-orm";

// Seed message templates for WhatsApp conversation flows
async function seedTemplates() {
  console.log("🌱 Starting template seed...");

  try {
    // Campaign Entry Template (First message with language selection)
    const campaignEntry = {
      name: "sunshine_campaign_entry",
      flowType: "campaign",
      stepKey: "campaign_entry",
      messageType: "button",
      language: "en",
      bodyText: "Hello, We are a PM Surya Ghar registered Solar Vendor.\nFrom application to net-metering and installation-we handle it all.\nTo Continue, Choose:",
      headerMediaId: "4245254242364293",
      footerText: "Licensed PM Surya Ghar Solar Vendor",
      buttons: [
        { id: "hindi", title: "हिंदी", nextStep: "main_menu" },
        { id: "english", title: "English", nextStep: "main_menu" },
        { id: "visit_website", title: "Visit Website", nextStep: null }
      ],
      metaStatus: "approved"
    };

    console.log("📝 Inserting campaign_entry template...");
    await db.insert(messageTemplates)
      .values(campaignEntry)
      .onConflictDoUpdate({
        target: [messageTemplates.flowType, messageTemplates.language, messageTemplates.stepKey],
        set: campaignEntry
      });

    // Main Menu - English
    const mainMenuEn = {
      name: "sunshine_main_menu_en",
      flowType: "campaign",
      stepKey: "main_menu",
      messageType: "button",
      language: "en",
      headerText: "Main Menu",
      bodyText: "Thank you for choosing Sunshine Power!\n\nHow can we help you today?",
      footerText: "PM Surya Ghar Registered Vendor",
      buttons: [
        { id: "site_survey", title: "Book Site Survey", nextStep: null },
        { id: "price_estimate", title: "Price Estimate", nextStep: null },
        { id: "help", title: "Service & Support", nextStep: "help_submenu" }
      ],
      metaStatus: "approved"
    };

    console.log("📝 Inserting main_menu_en template...");
    await db.insert(messageTemplates)
      .values(mainMenuEn)
      .onConflictDoUpdate({
        target: [messageTemplates.flowType, messageTemplates.language, messageTemplates.stepKey],
        set: mainMenuEn
      });

    // Main Menu - Hindi
    const mainMenuHi = {
      name: "sunshine_main_menu_hi",
      flowType: "campaign",
      stepKey: "main_menu",
      messageType: "button",
      language: "hi",
      headerText: "मुख्य मेनू",
      bodyText: "Sunshine Power चुनने के लिए धन्यवाद!\n\nआज हम आपकी कैसे मदद कर सकते हैं?",
      footerText: "PM Surya Ghar पंजीकृत विक्रेता",
      buttons: [
        { id: "site_survey", title: "साइट सर्वे बुक करें", nextStep: null },
        { id: "price_estimate", title: "मूल्य अनुमान", nextStep: null },
        { id: "help", title: "सेवा और सहायता", nextStep: "help_submenu" }
      ],
      metaStatus: "approved"
    };

    console.log("📝 Inserting main_menu_hi template...");
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

    console.log("✅ Template seed completed successfully!");
    console.log("\nTemplates loaded:");
    console.log("  - Campaign Entry (with image header, 3 buttons)");
    console.log("  - Main Menu English (3 buttons)");
    console.log("  - Main Menu Hindi (3 buttons)");
    console.log("  - Help Submenu English (3 buttons)");
    console.log("  - Help Submenu Hindi (3 buttons)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    process.exit(1);
  }
}

seedTemplates();
