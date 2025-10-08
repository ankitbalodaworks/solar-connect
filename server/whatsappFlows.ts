// WhatsApp Flow JSON Definitions
// Version 7.2, Data API Version 3.0
// All forms are single-screen with submit buttons that trigger data_exchange

export interface WhatsAppFlow {
  version: string;
  data_api_version: string;
  routing_model: Record<string, string[]>;
  screens: FlowScreen[];
}

export interface FlowScreen {
  id: string;
  title: string;
  terminal?: boolean;
  layout: {
    type: string;
    children: any[];
  };
}

// Site Survey Flow
export const SURVEY_FLOW: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    SURVEY_FORM: ["SURVEY_SUCCESS"],
    SURVEY_SUCCESS: []
  },
  screens: [
    {
      id: "SURVEY_FORM",
      title: "Book Site Survey",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "TextInput",
                name: "full_name",
                label: "Full Name",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "mobile",
                label: "Mobile",
                required: true,
                "input-type": "phone"
              },
              {
                type: "TextArea",
                name: "address",
                label: "Address",
                required: true
              },
              {
                type: "TextInput",
                name: "village",
                label: "Village/Town",
                required: true,
                "input-type": "text"
              },
              {
                type: "DatePicker",
                name: "preferred_date",
                label: "Preferred Date",
                required: true
              },
              {
                type: "TextInput",
                name: "preferred_time",
                label: "Preferred Time (e.g. 10:00 AM)",
                required: true,
                "input-type": "text"
              },
              {
                type: "Footer",
                label: "Submit",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_survey_form",
                    form: "${form}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      id: "SURVEY_SUCCESS",
      title: "Thank you!",
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextBody",
            text: "Your survey request has been recorded. Our team will contact you shortly."
          }
        ]
      }
    }
  ]
};

// Price Estimate Flow
export const PRICE_FLOW: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    PRICE_FORM: ["PRICE_SUCCESS"],
    PRICE_SUCCESS: []
  },
  screens: [
    {
      id: "PRICE_FORM",
      title: "Price Estimate",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "TextInput",
                name: "full_name",
                label: "Full Name",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "mobile",
                label: "Mobile",
                required: true,
                "input-type": "phone"
              },
              {
                type: "TextArea",
                name: "address",
                label: "Address",
                required: true
              },
              {
                type: "TextInput",
                name: "village",
                label: "Village/Town",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "avg_bill",
                label: "Avg Monthly Bill (₹)",
                required: true,
                "input-type": "number"
              },
              {
                type: "TextInput",
                name: "monthly_units",
                label: "Avg Monthly Units (kWh)",
                required: true,
                "input-type": "number"
              },
              {
                type: "Dropdown",
                name: "phase",
                label: "Phase",
                required: true,
                "data-source": [
                  { id: "1p", title: "1φ" },
                  { id: "3p", title: "3φ" }
                ]
              },
              {
                type: "Dropdown",
                name: "roof_type",
                label: "Roof Type",
                required: true,
                "data-source": [
                  { id: "rcc", title: "RCC" },
                  { id: "tin", title: "Tin/Sheet" },
                  { id: "other", title: "Other" }
                ]
              },
              {
                type: "Footer",
                label: "Submit",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_price_form",
                    form: "${form}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      id: "PRICE_SUCCESS",
      title: "Thank you!",
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextBody",
            text: "Your details are saved. We'll send an estimate soon."
          }
        ]
      }
    }
  ]
};

// Service Request Flow
export const SERVICE_FLOW: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    SERVICE_FORM: ["SERVICE_SUCCESS"],
    SERVICE_SUCCESS: []
  },
  screens: [
    {
      id: "SERVICE_FORM",
      title: "Maintenance / Service",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "TextInput",
                name: "full_name",
                label: "Full Name",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "mobile",
                label: "Mobile",
                required: true,
                "input-type": "phone"
              },
              {
                type: "TextArea",
                name: "address",
                label: "Address",
                required: true
              },
              {
                type: "TextInput",
                name: "village",
                label: "Village/Town",
                required: true,
                "input-type": "text"
              },
              {
                type: "Dropdown",
                name: "issue_type",
                label: "Issue Type",
                required: true,
                "data-source": [
                  { id: "inverter", title: "Inverter" },
                  { id: "panels", title: "Panels" },
                  { id: "wiring", title: "Wiring" },
                  { id: "meter", title: "Meter/Net-Meter" },
                  { id: "other", title: "Other" }
                ]
              },
              {
                type: "RadioButtonsGroup",
                name: "urgency",
                label: "Urgency",
                required: true,
                "data-source": [
                  { id: "low", title: "Low" },
                  { id: "normal", title: "Normal" },
                  { id: "high", title: "High" }
                ]
              },
              {
                type: "DatePicker",
                name: "preferred_date",
                label: "Preferred Date",
                required: true
              },
              {
                type: "TextInput",
                name: "preferred_time",
                label: "Preferred Time (e.g. 10:00 AM)",
                required: true,
                "input-type": "text"
              },
              {
                type: "Footer",
                label: "Submit",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_service_form",
                    form: "${form}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      id: "SERVICE_SUCCESS",
      title: "Thank you!",
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextBody",
            text: "Your service request has been logged. We'll reach out."
          }
        ]
      }
    }
  ]
};

// Callback Request Flow
export const CALLBACK_FLOW: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    CALLBACK_FORM: ["CALLBACK_SUCCESS"],
    CALLBACK_SUCCESS: []
  },
  screens: [
    {
      id: "CALLBACK_FORM",
      title: "Request Callback",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "TextInput",
                name: "full_name",
                label: "Full Name",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "mobile",
                label: "Mobile",
                required: true,
                "input-type": "phone"
              },
              {
                type: "RadioButtonsGroup",
                name: "best_time",
                label: "Best Time to Call",
                required: true,
                "data-source": [
                  { id: "morning", title: "Morning" },
                  { id: "afternoon", title: "Afternoon" },
                  { id: "evening", title: "Evening" }
                ]
              },
              {
                type: "Dropdown",
                name: "topic",
                label: "Topic",
                required: true,
                "data-source": [
                  { id: "site_survey", title: "Site Survey" },
                  { id: "price_estimate", title: "Price Estimate" },
                  { id: "maintenance", title: "Maintenance/Service" },
                  { id: "other", title: "Other" }
                ]
              },
              {
                type: "TextArea",
                name: "notes",
                label: "Notes (Optional)",
                required: false
              },
              {
                type: "Footer",
                label: "Submit",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_callback_form",
                    form: "${form}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      id: "CALLBACK_SUCCESS",
      title: "Thank you!",
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextBody",
            text: "We'll call you at your preferred time."
          }
        ]
      }
    }
  ]
};

// Hindi Site Survey Flow
export const SURVEY_FLOW_HI: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    SURVEY_FORM: ["SURVEY_SUCCESS"],
    SURVEY_SUCCESS: []
  },
  screens: [
    {
      id: "SURVEY_FORM",
      title: "साइट सर्वे बुक करें",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "TextInput",
                name: "full_name",
                label: "पूरा नाम",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "mobile",
                label: "मोबाइल",
                required: true,
                "input-type": "phone"
              },
              {
                type: "TextArea",
                name: "address",
                label: "पता",
                required: true
              },
              {
                type: "TextInput",
                name: "village",
                label: "गांव/शहर",
                required: true,
                "input-type": "text"
              },
              {
                type: "DatePicker",
                name: "preferred_date",
                label: "पसंदीदा तारीख",
                required: true
              },
              {
                type: "TextInput",
                name: "preferred_time",
                label: "पसंदीदा समय (जैसे 10:00 AM)",
                required: true,
                "input-type": "text"
              },
              {
                type: "Footer",
                label: "जमा करें",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_survey_form",
                    form: "${form}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      id: "SURVEY_SUCCESS",
      title: "धन्यवाद!",
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextBody",
            text: "आपका सर्वे अनुरोध दर्ज किया गया है। हमारी टीम जल्द ही आपसे संपर्क करेगी।"
          }
        ]
      }
    }
  ]
};

// Hindi Price Estimate Flow
export const PRICE_FLOW_HI: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    PRICE_FORM: ["PRICE_SUCCESS"],
    PRICE_SUCCESS: []
  },
  screens: [
    {
      id: "PRICE_FORM",
      title: "मूल्य अनुमान",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "TextInput",
                name: "full_name",
                label: "पूरा नाम",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "mobile",
                label: "मोबाइल",
                required: true,
                "input-type": "phone"
              },
              {
                type: "TextArea",
                name: "address",
                label: "पता",
                required: true
              },
              {
                type: "TextInput",
                name: "village",
                label: "गांव/शहर",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "avg_bill",
                label: "औसत मासिक बिल (₹)",
                required: true,
                "input-type": "number"
              },
              {
                type: "TextInput",
                name: "monthly_units",
                label: "औसत मासिक यूनिट (kWh)",
                required: true,
                "input-type": "number"
              },
              {
                type: "Dropdown",
                name: "phase",
                label: "फेज",
                required: true,
                "data-source": [
                  { id: "1p", title: "1φ" },
                  { id: "3p", title: "3φ" }
                ]
              },
              {
                type: "Dropdown",
                name: "roof_type",
                label: "छत का प्रकार",
                required: true,
                "data-source": [
                  { id: "rcc", title: "RCC" },
                  { id: "tin", title: "टिन/शीट" },
                  { id: "other", title: "अन्य" }
                ]
              },
              {
                type: "Footer",
                label: "जमा करें",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_price_form",
                    form: "${form}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      id: "PRICE_SUCCESS",
      title: "धन्यवाद!",
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextBody",
            text: "आपका विवरण सहेजा गया है। हम जल्द ही अनुमान भेजेंगे।"
          }
        ]
      }
    }
  ]
};

// Hindi Service Request Flow
export const SERVICE_FLOW_HI: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    SERVICE_FORM: ["SERVICE_SUCCESS"],
    SERVICE_SUCCESS: []
  },
  screens: [
    {
      id: "SERVICE_FORM",
      title: "रखरखाव / सेवा",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "TextInput",
                name: "full_name",
                label: "पूरा नाम",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "mobile",
                label: "मोबाइल",
                required: true,
                "input-type": "phone"
              },
              {
                type: "TextArea",
                name: "address",
                label: "पता",
                required: true
              },
              {
                type: "TextInput",
                name: "village",
                label: "गांव/शहर",
                required: true,
                "input-type": "text"
              },
              {
                type: "Dropdown",
                name: "issue_type",
                label: "समस्या का प्रकार",
                required: true,
                "data-source": [
                  { id: "inverter", title: "इन्वर्टर" },
                  { id: "panels", title: "पैनल" },
                  { id: "wiring", title: "वायरिंग" },
                  { id: "meter", title: "मीटर/नेट-मीटर" },
                  { id: "other", title: "अन्य" }
                ]
              },
              {
                type: "RadioButtonsGroup",
                name: "urgency",
                label: "तात्कालिकता",
                required: true,
                "data-source": [
                  { id: "low", title: "कम" },
                  { id: "normal", title: "सामान्य" },
                  { id: "high", title: "उच्च" }
                ]
              },
              {
                type: "DatePicker",
                name: "preferred_date",
                label: "पसंदीदा तारीख",
                required: true
              },
              {
                type: "TextInput",
                name: "preferred_time",
                label: "पसंदीदा समय (जैसे 10:00 AM)",
                required: true,
                "input-type": "text"
              },
              {
                type: "Footer",
                label: "जमा करें",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_service_form",
                    form: "${form}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      id: "SERVICE_SUCCESS",
      title: "धन्यवाद!",
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextBody",
            text: "आपका सेवा अनुरोध लॉग किया गया है। हम संपर्क करेंगे।"
          }
        ]
      }
    }
  ]
};

// Hindi Callback Request Flow
export const CALLBACK_FLOW_HI: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    CALLBACK_FORM: ["CALLBACK_SUCCESS"],
    CALLBACK_SUCCESS: []
  },
  screens: [
    {
      id: "CALLBACK_FORM",
      title: "कॉलबैक का अनुरोध",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "TextInput",
                name: "full_name",
                label: "पूरा नाम",
                required: true,
                "input-type": "text"
              },
              {
                type: "TextInput",
                name: "mobile",
                label: "मोबाइल",
                required: true,
                "input-type": "phone"
              },
              {
                type: "RadioButtonsGroup",
                name: "best_time",
                label: "कॉल करने का सबसे अच्छा समय",
                required: true,
                "data-source": [
                  { id: "morning", title: "सुबह" },
                  { id: "afternoon", title: "दोपहर" },
                  { id: "evening", title: "शाम" }
                ]
              },
              {
                type: "Dropdown",
                name: "topic",
                label: "विषय",
                required: true,
                "data-source": [
                  { id: "site_survey", title: "साइट सर्वे" },
                  { id: "price_estimate", title: "मूल्य अनुमान" },
                  { id: "maintenance", title: "रखरखाव/सेवा" },
                  { id: "other", title: "अन्य" }
                ]
              },
              {
                type: "TextArea",
                name: "notes",
                label: "टिप्पणियां (वैकल्पिक)",
                required: false
              },
              {
                type: "Footer",
                label: "जमा करें",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_callback_form",
                    form: "${form}"
                  }
                }
              }
            ]
          }
        ]
      }
    },
    {
      id: "CALLBACK_SUCCESS",
      title: "धन्यवाद!",
      terminal: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "TextBody",
            text: "हम आपके पसंदीदा समय पर आपको कॉल करेंगे।"
          }
        ]
      }
    }
  ]
};

// Export all flows
export const ALL_FLOWS = {
  SURVEY: SURVEY_FLOW,
  PRICE: PRICE_FLOW,
  SERVICE: SERVICE_FLOW,
  CALLBACK: CALLBACK_FLOW,
  SURVEY_HI: SURVEY_FLOW_HI,
  PRICE_HI: PRICE_FLOW_HI,
  SERVICE_HI: SERVICE_FLOW_HI,
  CALLBACK_HI: CALLBACK_FLOW_HI
};
