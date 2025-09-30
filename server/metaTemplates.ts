// Meta WhatsApp Template Definitions for API Submission
// These templates are compatible with Meta's approval requirements

export interface MetaTemplate {
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  components: MetaTemplateComponent[];
}

export interface MetaTemplateComponent {
  type: "header" | "body" | "footer" | "buttons";
  format?: "text" | "image" | "video" | "document";
  text?: string;
  buttons?: MetaButton[];
  example?: {
    header_handle?: string[];
    body_text?: string[][];
  };
}

export interface MetaButton {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
  text: string;
  url?: string;
  phone_number?: string;
}

// Campaign Lead Templates
const campaignLeadTemplates: MetaTemplate[] = [
  // Template 1: Language Selection (Campaign - English)
  {
    name: "sunshine_campaign_language_en",
    category: "MARKETING",
    language: "en_US",
    components: [
      {
        type: "header",
        format: "image",
        example: {
          header_handle: ["4245254242364293"]
        }
      },
      {
        type: "body",
        text: "Welcome to Sunshine Power!\n\nWe are a PM Surya Ghar registered vendor offering rooftop solar installations in Rajasthan.\n\nPlease reply with your preferred language:\n- Reply \"1\" for English\n- Reply \"2\" for हिंदी (Hindi)"
      },
      {
        type: "footer",
        text: "Registered PM Surya Ghar Solar Vendor"
      }
    ]
  },

  // Template 2: Language Selection (Campaign - Hindi)
  {
    name: "sunshine_campaign_language_hi",
    category: "MARKETING",
    language: "hi",
    components: [
      {
        type: "header",
        format: "image",
        example: {
          header_handle: ["4245254242364293"]
        }
      },
      {
        type: "body",
        text: "Sunshine Power में आपका स्वागत है!\n\nहम राजस्थान में छत पर सोलर इंस्टॉलेशन की पेशकश करने वाले PM Surya Ghar पंजीकृत विक्रेता हैं।\n\nकृपया अपनी पसंदीदा भाषा चुनें:\n- English के लिए \"1\" लिखें\n- हिंदी के लिए \"2\" लिखें"
      },
      {
        type: "footer",
        text: "पंजीकृत PM Surya Ghar सोलर विक्रेता"
      }
    ]
  },

  // Template 3: Solar Offer (Campaign - English)
  {
    name: "sunshine_solar_offer_en",
    category: "MARKETING",
    language: "en_US",
    components: [
      {
        type: "header",
        format: "text",
        text: "PM Surya Ghar Solar Solutions"
      },
      {
        type: "body",
        text: "Great! Let me tell you about our PM Surya Ghar solar installation services:\n\n✅ Government subsidy up to 78,000 INR\n✅ 1kW, 2kW, 3kW, 5kW systems available\n✅ Professional installation in Rajasthan\n✅ 25-year panel warranty\n✅ Save up to 90% on electricity bills\n\nWould you like us to schedule a FREE site survey at your location?\n\n- Reply \"YES\" to schedule a survey\n- Reply \"INFO\" for more information"
      },
      {
        type: "footer",
        text: "Sunshine Power - Registered Vendor"
      },
      {
        type: "buttons",
        buttons: [
          { type: "QUICK_REPLY", text: "Schedule Survey" },
          { type: "QUICK_REPLY", text: "More Info" }
        ]
      }
    ]
  },

  // Template 4: Solar Offer (Campaign - Hindi)
  {
    name: "sunshine_solar_offer_hi",
    category: "MARKETING",
    language: "hi",
    components: [
      {
        type: "header",
        format: "text",
        text: "PM Surya Ghar सोलर समाधान"
      },
      {
        type: "body",
        text: "बहुत बढ़िया! हमारी PM Surya Ghar सोलर इंस्टॉलेशन सेवाओं के बारे में जानें:\n\n✅ 78,000 रुपये तक सरकारी सब्सिडी\n✅ 1kW, 2kW, 3kW, 5kW सिस्टम उपलब्ध\n✅ राजस्थान में प्रोफेशनल इंस्टॉलेशन\n✅ 25 साल की पैनल वारंटी\n✅ बिजली बिल में 90% तक की बचत\n\nक्या आप अपने स्थान पर मुफ्त साइट सर्वे शेड्यूल करना चाहेंगे?\n\n- सर्वे के लिए \"हां\" लिखें\n- जानकारी के लिए \"जानकारी\" लिखें"
      },
      {
        type: "footer",
        text: "Sunshine Power - पंजीकृत विक्रेता"
      },
      {
        type: "buttons",
        buttons: [
          { type: "QUICK_REPLY", text: "सर्वे बुक करें" },
          { type: "QUICK_REPLY", text: "जानकारी" }
        ]
      }
    ]
  },

  // Template 5: Survey Schedule (Campaign - English)
  {
    name: "sunshine_survey_schedule_en",
    category: "MARKETING",
    language: "en_US",
    components: [
      {
        type: "header",
        format: "text",
        text: "Schedule Site Survey"
      },
      {
        type: "body",
        text: "Perfect! Please select your preferred time for the site survey:\n\nMORNING SLOTS:\n1. 9 AM - 11 AM (Morning survey)\n2. 11 AM - 1 PM (Late morning)\n\nAFTERNOON SLOTS:\n3. 2 PM - 4 PM (Afternoon survey)\n4. 4 PM - 6 PM (Evening survey)\n\nReply with the number (1, 2, 3, or 4) of your preferred time slot."
      },
      {
        type: "footer",
        text: "Our team will contact you to confirm"
      }
    ]
  },

  // Template 6: Survey Schedule (Campaign - Hindi)
  {
    name: "sunshine_survey_schedule_hi",
    category: "MARKETING",
    language: "hi",
    components: [
      {
        type: "header",
        format: "text",
        text: "साइट सर्वे शेड्यूल करें"
      },
      {
        type: "body",
        text: "बढ़िया! कृपया साइट सर्वे के लिए अपना पसंदीदा समय चुनें:\n\nसुबह के समय:\n1. सुबह 9 - 11 बजे (सुबह का सर्वे)\n2. सुबह 11 - दोपहर 1 बजे (देर सुबह)\n\nदोपहर के समय:\n3. दोपहर 2 - 4 बजे (दोपहर का सर्वे)\n4. शाम 4 - 6 बजे (शाम का सर्वे)\n\nअपने पसंदीदा समय के लिए नंबर (1, 2, 3, या 4) लिखकर भेजें।"
      },
      {
        type: "footer",
        text: "हमारी टीम कन्फर्म करने के लिए आपसे संपर्क करेगी"
      }
    ]
  },

  // Template 7: Confirmation (Campaign - English)
  {
    name: "sunshine_lead_confirmation_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "body",
        text: "Thank you for your interest in Sunshine Power solar installations! ☀️\n\nOur team will contact you shortly to confirm your survey details and answer any questions.\n\nFor immediate assistance, you can also call us at our office.\n\nWe look forward to helping you save on electricity with clean solar energy!"
      }
    ]
  },

  // Template 8: Confirmation (Campaign - Hindi)
  {
    name: "sunshine_lead_confirmation_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "body",
        text: "Sunshine Power सोलर इंस्टॉलेशन में आपकी रुचि के लिए धन्यवाद! ☀️\n\nहमारी टीम जल्द ही आपसे संपर्क करेगी और आपके सर्वे की जानकारी कन्फर्म करेगी।\n\nतत्काल सहायता के लिए, आप हमारे ऑफिस में भी कॉल कर सकते हैं।\n\nहम स्वच्छ सौर ऊर्जा से बिजली बचाने में आपकी मदद करने के लिए उत्सुक हैं!"
      }
    ]
  }
];

// Service Request Templates
const serviceRequestTemplates: MetaTemplate[] = [
  // Template 9: Service Language Selection (English)
  {
    name: "sunshine_service_language_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "header",
        format: "image",
        example: {
          header_handle: ["4245254242364293"]
        }
      },
      {
        type: "body",
        text: "Welcome to Sunshine Power Service! 🔧\n\nWe provide installation, maintenance, and repair services for solar systems in Rajasthan.\n\nPlease reply with your preferred language:\n- Reply \"1\" for English\n- Reply \"2\" for हिंदी (Hindi)"
      },
      {
        type: "footer",
        text: "Sunshine Power - Service Center"
      }
    ]
  },

  // Template 10: Service Language Selection (Hindi)
  {
    name: "sunshine_service_language_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "header",
        format: "image",
        example: {
          header_handle: ["4245254242364293"]
        }
      },
      {
        type: "body",
        text: "Sunshine Power सेवा में आपका स्वागत है! 🔧\n\nहम राजस्थान में सोलर सिस्टम के लिए इंस्टॉलेशन, रखरखाव और मरम्मत सेवाएं प्रदान करते हैं।\n\nकृपया अपनी पसंदीदा भाषा चुनें:\n- English के लिए \"1\" लिखें\n- हिंदी के लिए \"2\" लिखें"
      },
      {
        type: "footer",
        text: "Sunshine Power - सेवा केंद्र"
      }
    ]
  },

  // Template 11: Service Menu (English)
  {
    name: "sunshine_service_menu_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "header",
        format: "text",
        text: "Select Service Type"
      },
      {
        type: "body",
        text: "How can we help you today? Please select the type of service you need:\n\n1. New Installation - Install new solar system\n2. Maintenance/Cleaning - Panel cleaning & checkup\n3. Repair/Technical Issue - Fix technical problems\n4. Other Services - Other inquiries\n\nReply with the number (1, 2, 3, or 4) for your required service."
      },
      {
        type: "footer",
        text: "Sunshine Power - Service Options"
      }
    ]
  },

  // Template 12: Service Menu (Hindi)
  {
    name: "sunshine_service_menu_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "header",
        format: "text",
        text: "सेवा प्रकार चुनें"
      },
      {
        type: "body",
        text: "आज हम आपकी कैसे मदद कर सकते हैं? कृपया आवश्यक सेवा का प्रकार चुनें:\n\n1. नई इंस्टॉलेशन - नया सोलर सिस्टम लगाएं\n2. रखरखाव/सफाई - पैनल की सफाई और जांच\n3. मरम्मत/तकनीकी समस्या - तकनीकी समस्याओं को ठीक करें\n4. अन्य सेवाएं - अन्य पूछताछ\n\nअपनी आवश्यक सेवा के लिए नंबर (1, 2, 3, या 4) लिखें।"
      },
      {
        type: "footer",
        text: "Sunshine Power - सेवा विकल्प"
      }
    ]
  },

  // Template 13: Problem Description (English)
  {
    name: "sunshine_problem_description_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "header",
        format: "text",
        text: "Describe Your Issue"
      },
      {
        type: "body",
        text: "Please describe your issue or service requirement in a few words. Our technician will review it and contact you soon.\n\nFor example: \"Solar panels not generating power\" or \"Need panel cleaning service\""
      },
      {
        type: "footer",
        text: "Reply with your description"
      }
    ]
  },

  // Template 14: Problem Description (Hindi)
  {
    name: "sunshine_problem_description_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "header",
        format: "text",
        text: "अपनी समस्या बताएं"
      },
      {
        type: "body",
        text: "कृपया अपनी समस्या या सेवा की आवश्यकता को कुछ शब्दों में बताएं। हमारा तकनीशियन इसकी समीक्षा करेगा और जल्द ही आपसे संपर्क करेगा।\n\nउदाहरण: \"सोलर पैनल बिजली नहीं बना रहे\" या \"पैनल की सफाई सेवा चाहिए\""
      },
      {
        type: "footer",
        text: "अपना विवरण लिखकर भेजें"
      }
    ]
  },

  // Template 15: Urgency Selection (English)
  {
    name: "sunshine_urgency_select_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "header",
        format: "text",
        text: "Select Priority Level"
      },
      {
        type: "body",
        text: "How urgent is this service request?\n\n1. 🔴 Urgent - Immediate attention needed\n2. 🟡 Normal - Regular priority\n3. 🟢 Low - Can wait a few days\n\nReply with the number (1, 2, or 3) for urgency level."
      },
      {
        type: "footer",
        text: "This helps us prioritize your request"
      }
    ]
  },

  // Template 16: Urgency Selection (Hindi)
  {
    name: "sunshine_urgency_select_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "header",
        format: "text",
        text: "प्राथमिकता स्तर चुनें"
      },
      {
        type: "body",
        text: "यह सेवा अनुरोध कितना जरूरी है?\n\n1. 🔴 तुरंत - तत्काल ध्यान देने की आवश्यकता\n2. 🟡 सामान्य - नियमित प्राथमिकता\n3. 🟢 कम - कुछ दिन प्रतीक्षा कर सकते हैं\n\nतात्कालिकता स्तर के लिए नंबर (1, 2, या 3) लिखें।"
      },
      {
        type: "footer",
        text: "यह हमें आपके अनुरोध को प्राथमिकता देने में मदद करता है"
      }
    ]
  },

  // Template 17: Service Confirmation (English)
  {
    name: "sunshine_service_confirmation_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "body",
        text: "Thank you for contacting Sunshine Power! 🔧\n\nYour service request has been received. Our technician will review your request and contact you shortly to schedule a visit.\n\nExpected response: Within 24 hours\n\nFor urgent issues, please call our service center directly."
      }
    ]
  },

  // Template 18: Service Confirmation (Hindi)
  {
    name: "sunshine_service_confirmation_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "body",
        text: "Sunshine Power से संपर्क करने के लिए धन्यवाद! 🔧\n\nआपका सेवा अनुरोध प्राप्त हो गया है। हमारा तकनीशियन आपके अनुरोध की समीक्षा करेगा और जल्द ही विजिट शेड्यूल करने के लिए आपसे संपर्क करेगा।\n\nअपेक्षित प्रतिक्रिया: 24 घंटे के भीतर\n\nतत्काल मुद्दों के लिए, कृपया सीधे हमारे सेवा केंद्र पर कॉल करें।"
      }
    ]
  }
];

// Export all templates
export const allMetaTemplates: MetaTemplate[] = [
  ...campaignLeadTemplates,
  ...serviceRequestTemplates
];

// Template name to flow step mapping for future use
export const templateMapping = {
  campaign_lead: {
    en: {
      language_select: "sunshine_campaign_language_en",
      offer: "sunshine_solar_offer_en",
      survey_schedule: "sunshine_survey_schedule_en",
      complete: "sunshine_lead_confirmation_en"
    },
    hi: {
      language_select: "sunshine_campaign_language_hi",
      offer: "sunshine_solar_offer_hi",
      survey_schedule: "sunshine_survey_schedule_hi",
      complete: "sunshine_lead_confirmation_hi"
    }
  },
  service_request: {
    en: {
      language_select: "sunshine_service_language_en",
      service_menu: "sunshine_service_menu_en",
      problem_description: "sunshine_problem_description_en",
      urgency_select: "sunshine_urgency_select_en",
      complete: "sunshine_service_confirmation_en"
    },
    hi: {
      language_select: "sunshine_service_language_hi",
      service_menu: "sunshine_service_menu_hi",
      problem_description: "sunshine_problem_description_hi",
      urgency_select: "sunshine_urgency_select_hi",
      complete: "sunshine_service_confirmation_hi"
    }
  }
};
