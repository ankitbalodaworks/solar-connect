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
  type: "QUICK_REPLY" | "URL" | "PHONE_NUMBER";
  text: string;
  url?: string;
  phone_number?: string;
}

// Campaign Entry Template (Entry point - MUST be approved by Meta)
const campaignEntryTemplates: MetaTemplate[] = [
  {
    name: "sunshine_campaign_entry",
    category: "MARKETING",
    language: "en_US",
    components: [
      {
        type: "HEADER",
        format: "IMAGE",
        example: {
          header_handle: ["4245254242364293"]
        }
      },
      {
        type: "BODY",
        text: "Hello, We are a PM Surya Ghar registered Solar Vendor.\nFrom application to net-metering and installation-we handle it all.\nTo Continue, Choose:"
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

// Main Menu Templates
const mainMenuTemplates: MetaTemplate[] = [
  {
    name: "sunshine_main_menu_en",
    category: "UTILITY",
    language: "en_US",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Main Menu"
      },
      {
        type: "BODY",
        text: "Thank you for choosing Sunshine Power!\n\nHow can we help you today?"
      },
      {
        type: "FOOTER",
        text: "PM Surya Ghar Registered Vendor"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "Book Site Survey" },
          { type: "QUICK_REPLY", text: "Price Estimate" },
          { type: "QUICK_REPLY", text: "Service & Support" }
        ]
      }
    ]
  },
  {
    name: "sunshine_main_menu_hi",
    category: "UTILITY",
    language: "hi",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "मुख्य मेनू"
      },
      {
        type: "BODY",
        text: "Sunshine Power चुनने के लिए धन्यवाद!\n\nआज हम आपकी कैसे मदद कर सकते हैं?"
      },
      {
        type: "FOOTER",
        text: "PM Surya Ghar पंजीकृत विक्रेता"
      },
      {
        type: "BUTTONS",
        buttons: [
          { type: "QUICK_REPLY", text: "साइट सर्वे बुक करें" },
          { type: "QUICK_REPLY", text: "मूल्य अनुमान" },
          { type: "QUICK_REPLY", text: "सेवा और सहायता" }
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

// Export all templates
export const allMetaTemplates: MetaTemplate[] = [
  ...campaignEntryTemplates,
  ...mainMenuTemplates,
  ...priceSubmenuTemplates,
  ...helpSubmenuTemplates,
  ...serviceUrgencyTemplates,
  ...completionTemplates
];

// Template name to database step key mapping
// This helps map Meta template names to our database template step keys
export const metaToStepKeyMapping: Record<string, { flowType: string, stepKey: string, language: string }> = {
  "sunshine_campaign_entry": { flowType: "campaign", stepKey: "campaign_entry", language: "en" },
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
