// Meta WhatsApp Template Definitions for API Submission
// These templates are compatible with Meta's approval requirements
// Note: Only templates with buttons/lists or those initiating conversations need Meta approval
// Text prompts within active 24-hour conversation windows can be sent as interactive messages

export interface MetaTemplate {
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string;
  components: MetaTemplateComponent[];
}

export interface MetaTemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  buttons?: MetaButton[];
  example?: {
    header_handle?: string[];
    body_text?: string[][];
  };
}

export interface MetaButton {
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "FLOW";
  text: string;
  url?: string;
  phone_number?: string;
  flow_id?: string;
  flow_action?: "navigate" | "data_exchange";
}

// Campaign Entry Template (Entry point - MUST be approved by Meta)
// Trust-first approach with PM Surya Ghar registration prominently displayed
const campaignEntryTemplates: MetaTemplate[] = [
  {
    name: "sp_campaign_trust_v1",
    category: "MARKETING",
    language: "en_US",
    components: [
      {
        type: "HEADER",
        format: "IMAGE",
        example: {
          header_handle: ["4:TG9nbyAxXzE3NTk4NTQ4OTI5ODIuanBlZw==:aW1hZ2UvanBlZw==:ARbKrAjiGFtpMFf9gvz4tzGGAjzTEf7svRAKJPTQv5dNtWK8ywdQv5PXKdrhDE0FFqu9Z2dqXJSZ2p5qB21YIJekPhG7G5QYv-Ya7wHxNG9Vew:e:1760200621:1294266919049711:61579705302857:ARZz9M0TQE63V0q55BA"]
        }
      },
      {
        type: "BODY",
        text: "Hello,\n\nWe are a PM Surya Ghar registered Solar Vendor.\n\nFrom application to net-metering and installation - we handle it all.\n\nTo Continue, Choose:"
      },
      {
        type: "FOOTER",
        text: "Licensed PM Surya Ghar Solar Vendor"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "हिंदी" },
          { type: "QUICK_REPLY", text: "English" },
          { type: "URL", text: "Visit Website", url: "https://sunshinepower.net.in" }
        ]
      }
    ]
  }
];

// Main Menu Templates - Trust-first 3-button structure
const mainMenuTemplates: MetaTemplate[] = [
  {
    name: "sp_main_en_trio_v1",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "What would you like to do?"
      },
      {
        type: "BODY",
        text: "Choose an option:"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power - PM Surya Ghar Registered"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "Book Site Survey" },
          { type: "QUICK_REPLY", text: "Request Callback" },
          { type: "QUICK_REPLY", text: "Why Sunshine Power?" }
        ]
      }
    ]
  },
  {
    name: "sp_main_hi_trio_v1",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "आप क्या करना चाहेंगे?"
      },
      {
        type: "BODY",
        text: "विकल्प चुनें:"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power - PM Surya Ghar पंजीकृत"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "साइट सर्वे बुक करें" },
          { type: "QUICK_REPLY", text: "कॉलबैक का अनुरोध करें" },
          { type: "QUICK_REPLY", text: "सनशाइन पावर क्यों?" }
        ]
      }
    ]
  }
];

// Price Submenu Templates
const priceSubmenuTemplates: MetaTemplate[] = [
  {
    name: "sunshine_price_submenu_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Price & Expenditure Information"
      },
      {
        type: "BODY",
        text: "Would you like to know about our pricing and packages?\n\nPlease select an option:"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "Book site survey" },
          { type: "QUICK_REPLY", text: "Request callback" },
          { type: "QUICK_REPLY", text: "Other help" }
        ]
      }
    ]
  },
  {
    name: "sunshine_price_submenu_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "मूल्य और व्यय जानकारी"
      },
      {
        type: "BODY",
        text: "क्या आप हमारी कीमतों और पैकेजों के बारे में जानना चाहते हैं?\n\nकृपया एक विकल्प चुनें:"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "साइट सर्वे बुक करें" },
          { type: "QUICK_REPLY", text: "कॉलबैक का अनुरोध" },
          { type: "QUICK_REPLY", text: "अन्य सहायता" }
        ]
      }
    ]
  }
];

// Help Submenu Templates
const helpSubmenuTemplates: MetaTemplate[] = [
  {
    name: "sunshine_help_submenu_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Help & Support"
      },
      {
        type: "BODY",
        text: "We are here to help you!\n\nPlease select what you need:"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "Maintenance request" },
          { type: "QUICK_REPLY", text: "Request callback" },
          { type: "QUICK_REPLY", text: "Register issue" }
        ]
      }
    ]
  },
  {
    name: "sunshine_help_submenu_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "सहायता और समर्थन"
      },
      {
        type: "BODY",
        text: "हम आपकी मदद के लिए यहां हैं!\n\nकृपया चुनें आपको क्या चाहिए:"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "रखरखाव अनुरोध" },
          { type: "QUICK_REPLY", text: "कॉलबैक का अनुरोध" },
          { type: "QUICK_REPLY", text: "समस्या दर्ज करें" }
        ]
      }
    ]
  }
];

// Service Urgency Templates
const serviceUrgencyTemplates: MetaTemplate[] = [
  {
    name: "sunshine_service_urgency_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "BODY",
        text: "Please select the issue urgency level:"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "Low" },
          { type: "QUICK_REPLY", text: "Medium" },
          { type: "QUICK_REPLY", text: "High" }
        ]
      }
    ]
  },
  {
    name: "sunshine_service_urgency_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "BODY",
        text: "कृपया समस्या की तात्कालिकता का स्तर चुनें:"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "कम" },
          { type: "QUICK_REPLY", text: "मध्यम" },
          { type: "QUICK_REPLY", text: "उच्च" }
        ]
      }
    ]
  }
];

// Completion Templates (Thank you messages)
const completionTemplates: MetaTemplate[] = [
  // Survey Complete
  {
    name: "sunshine_survey_complete_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "BODY",
        text: "✅ Thank you! Your site survey request has been registered.\n\nOur team will contact you soon to confirm the appointment.\n\nFor any queries, visit: https://sunshinepower.net.in/"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      }
    ]
  },
  {
    name: "sunshine_survey_complete_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "BODY",
        text: "✅ धन्यवाद! आपका साइट सर्वे अनुरोध पंजीकृत हो गया है।\n\nहमारी टीम जल्द ही आपसे संपर्क करेगी।\n\nकिसी भी प्रश्न के लिए: https://sunshinepower.net.in/"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      }
    ]
  },
  // Callback Complete
  {
    name: "sunshine_callback_complete_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "BODY",
        text: "✅ Thank you! Your callback request has been registered.\n\nOur team will call you soon.\n\nWebsite: https://sunshinepower.net.in/"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      }
    ]
  },
  {
    name: "sunshine_callback_complete_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "BODY",
        text: "✅ धन्यवाद! आपका कॉलबैक अनुरोध पंजीकृत हो गया है।\n\nहमारी टीम जल्द ही आपको कॉल करेगी।\n\nवेबसाइट: https://sunshinepower.net.in/"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      }
    ]
  },
  // Service Complete
  {
    name: "sunshine_service_complete_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "BODY",
        text: "✅ Thank you! Your service request has been registered.\n\nOur technician will visit you soon.\n\nWebsite: https://sunshinepower.net.in/"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      }
    ]
  },
  {
    name: "sunshine_service_complete_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "BODY",
        text: "✅ धन्यवाद! आपका सेवा अनुरोध पंजीकृत हो गया है।\n\nहमारा तकनीशियन जल्द ही आपसे मिलेगा।\n\nवेबसाइट: https://sunshinepower.net.in/"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      }
    ]
  },
  // Issue Complete
  {
    name: "sunshine_issue_complete_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "BODY",
        text: "✅ Thank you! Your issue has been registered.\n\nOur team will review and contact you soon.\n\nWebsite: https://sunshinepower.net.in/"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      }
    ]
  },
  {
    name: "sunshine_issue_complete_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "BODY",
        text: "✅ धन्यवाद! आपकी समस्या पंजीकृत हो गई है।\n\nहमारी टीम समीक्षा करेगी और जल्द ही संपर्क करेगी।\n\nवेबसाइट: https://sunshinepower.net.in/"
      },
      {
        type: "FOOTER",
        text: "Sunshine Power"
      }
    ]
  }
];

// QR Code Survey Templates with Flow Buttons
const qrSurveyTemplates: MetaTemplate[] = [
  {
    name: "sp_qr_survey_en_v1",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Solar Site Survey Visit Request"
      },
      {
        type: "BODY",
        text: "Choose one language:"
      },
      {
        type: "FOOTER",
        text: "PM Surya Ghar Registered Solar Vendor"
      },
      {
        type: "BUTTONS",
        buttons: [
          { 
            type: "FLOW", 
            text: "Book Site Visit",
            flow_id: "1339797841199667",
            flow_action: "navigate"
          }
        ]
      }
    ]
  },
  {
    name: "sp_qr_survey_hi_v1",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "सोलर साइट सर्वे विज़िट अनुरोध"
      },
      {
        type: "BODY",
        text: "आपकी रुचि के लिए धन्यवाद! अपना मुफ्त सोलर साइट सर्वे बुक करने के लिए नीचे क्लिक करें।"
      },
      {
        type: "FOOTER",
        text: "PM सूर्य घर पंजीकृत सोलर विक्रेता"
      },
      {
        type: "BUTTONS",
        buttons: [
          { 
            type: "FLOW", 
            text: "साइट विज़िट बुक करें",
            flow_id: "1517637389655322",
            flow_action: "navigate"
          }
        ]
      }
    ]
  }
];

// Export all templates
export const allMetaTemplates: MetaTemplate[] = [
  ...campaignEntryTemplates,
  ...mainMenuTemplates,
  ...priceSubmenuTemplates,
  ...helpSubmenuTemplates,
  ...serviceUrgencyTemplates,
  ...completionTemplates,
  ...qrSurveyTemplates
];

// Template name to database step key mapping
// This helps map Meta template names to our database template step keys
export const metaToStepKeyMapping: Record<string, { flowType: string, stepKey: string, language: string }> = {
  // New trust-first templates
  "sp_campaign_trust_v1": { flowType: "campaign", stepKey: "campaign_entry", language: "en" },
  "sp_main_en_trio_v1": { flowType: "campaign", stepKey: "main_menu", language: "en" },
  "sp_main_hi_trio_v1": { flowType: "campaign", stepKey: "main_menu", language: "hi" },
  
  // QR Survey Flow templates
  "sp_qr_survey_en_v1": { flowType: "qr_survey", stepKey: "qr_survey", language: "en" },
  "sp_qr_survey_hi_v1": { flowType: "qr_survey", stepKey: "qr_survey", language: "hi" },
  
  // Legacy templates (for backwards compatibility)
  "sunshine_welcome": { flowType: "campaign", stepKey: "campaign_entry", language: "en" },
  "sunshine_main_menu_en": { flowType: "campaign", stepKey: "main_menu", language: "en" },
  "sunshine_main_menu_hi": { flowType: "campaign", stepKey: "main_menu", language: "hi" },
  "sunshine_price_submenu_en": { flowType: "campaign", stepKey: "price_submenu", language: "en" },
  "sunshine_price_submenu_hi": { flowType: "campaign", stepKey: "price_submenu", language: "hi" },
  "sunshine_help_submenu_en": { flowType: "campaign", stepKey: "help_submenu", language: "en" },
  "sunshine_help_submenu_hi": { flowType: "campaign", stepKey: "help_submenu", language: "hi" },
  "sunshine_service_urgency_en": { flowType: "campaign", stepKey: "service_urgency", language: "en" },
  "sunshine_service_urgency_hi": { flowType: "campaign", stepKey: "service_urgency", language: "hi" },
  "sunshine_survey_complete_en": { flowType: "campaign", stepKey: "survey_complete", language: "en" },
  "sunshine_survey_complete_hi": { flowType: "campaign", stepKey: "survey_complete", language: "hi" },
  "sunshine_callback_complete_en": { flowType: "campaign", stepKey: "callback_complete", language: "en" },
  "sunshine_callback_complete_hi": { flowType: "campaign", stepKey: "callback_complete", language: "hi" },
  "sunshine_service_complete_en": { flowType: "campaign", stepKey: "service_complete", language: "en" },
  "sunshine_service_complete_hi": { flowType: "campaign", stepKey: "service_complete", language: "hi" },
  "sunshine_issue_complete_en": { flowType: "campaign", stepKey: "issue_complete", language: "en" },
  "sunshine_issue_complete_hi": { flowType: "campaign", stepKey: "issue_complete", language: "hi" },
};

// Note: Text-based form field templates (name, mobile, address, village, date, time, description)
// do not require Meta pre-approval as they are sent as interactive text messages 
// within the active 24-hour conversation window after the initial template message
