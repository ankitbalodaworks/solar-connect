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
      language: null,
      bodyText: "🌞 Welcome to Sunshine Power!\n\nWe help rural Rajasthan save money with solar energy under PM Surya Ghar Yojana.\n\n🌞 सनशाइन पावर में आपका स्वागत है!\n\nहम PM सूर्य घर योजना के तहत ग्रामीण राजस्थान को सोलर ऊर्जा से पैसे बचाने में मदद करते हैं।\n\nPlease choose your language / कृपया अपनी भाषा चुनें:",
      headerMediaId: null,
      footerText: "Reply 'W' for website / वेबसाइट के लिए 'W' टाइप करें",
      buttons: [
        { id: "english", title: "English" },
        { id: "hindi", title: "हिंदी" }
      ],
      metaStatus: "draft"
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
      headerText: "☀️ Sunshine Power",
      bodyText: "How can we help you with solar energy today?",
      footerText: "PM Surya Ghar Registered Vendor",
      buttons: [
        { id: "site_survey", title: "📋 Book Site Survey" },
        { id: "price_estimate", title: "💰 Price Estimate" },
        { id: "callback", title: "📞 Request Callback" }
      ],
      metaStatus: "draft"
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
        { id: "service", title: "रखरखाव / सेवा अनुरोध", nextStep: null },
        { id: "callback", title: "कॉलबैक का अनुरोध", nextStep: null }
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

    console.log("✅ Template seed completed successfully!");
    console.log("\nTemplates loaded:");
    console.log("  - Campaign Entry (with image header)");
    console.log("  - Main Menu English (4 buttons)");
    console.log("  - Main Menu Hindi (4 buttons)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    process.exit(1);
  }
}

seedTemplates();
