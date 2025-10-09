// WhatsApp Flow JSON Definitions
// Version 7.2, Data API Version 3.0
// Premium trust-first conversation flow
// All forms simplified - no DISCOM/pincode/phase/roof fields

export interface WhatsAppFlow {
  version: string;
  data_api_version: string;
  routing_model: Record<string, string[]>;
  screens: FlowScreen[];
}

export interface FlowScreen {
  id: string;
  title: string;
  layout: {
    type: string;
    children: any[];
  };
}

// ============================================================================
// SURVEY FLOW (Book Site Survey) - English
// ============================================================================
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
                label: "Full Name (as per bill)",
                required: true,
                "input-type": "text",
                "max-length": 120,
                "error-message": "Enter your name"
              },
              {
                type: "PhoneNumber",
                name: "mobile",
                label: "Mobile (10-digit)",
                required: true,
                "error-message": "Enter a valid mobile number"
              },
              {
                type: "TextArea",
                name: "address",
                label: "Address",
                required: true,
                "max-length": 400
              },
              {
                type: "TextInput",
                name: "village",
                label: "Village/Town",
                required: true,
                "input-type": "text",
                "max-length": 120
              },
              {
                type: "DatePicker",
                name: "preferred_date",
                label: "Preferred Date",
                required: true
              },
              {
                type: "TimePicker",
                name: "preferred_time",
                label: "Preferred Time",
                required: true
              }
            ],
            actions: {
              submit: {
                label: "Submit",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_survey_form"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "SURVEY_SUCCESS",
      title: "Thank you!",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "Your site survey request has been recorded. Our team will contact you shortly."
          }
        ]
      }
    }
  ]
};

// ============================================================================
// SURVEY FLOW (Book Site Survey) - Hindi
// ============================================================================
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
                label: "पूरा नाम (बिल के अनुसार)",
                required: true,
                "input-type": "text",
                "max-length": 120,
                "error-message": "अपना नाम दर्ज करें"
              },
              {
                type: "PhoneNumber",
                name: "mobile",
                label: "मोबाइल (10-अंक)",
                required: true,
                "error-message": "वैध मोबाइल नंबर दर्ज करें"
              },
              {
                type: "TextArea",
                name: "address",
                label: "पता",
                required: true,
                "max-length": 400
              },
              {
                type: "TextInput",
                name: "village",
                label: "गाँव/कस्बा",
                required: true,
                "input-type": "text",
                "max-length": 120
              },
              {
                type: "DatePicker",
                name: "preferred_date",
                label: "पसंदीदा तारीख",
                required: true
              },
              {
                type: "TimePicker",
                name: "preferred_time",
                label: "पसंदीदा समय",
                required: true
              }
            ],
            actions: {
              submit: {
                label: "सबमिट करें",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_survey_form"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "SURVEY_SUCCESS",
      title: "धन्यवाद!",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "आपका साइट सर्वे अनुरोध दर्ज कर लिया गया है। हमारी टीम जल्द ही आपसे संपर्क करेगी।"
          }
        ]
      }
    }
  ]
};

// ============================================================================
// CALLBACK FLOW (Request Callback) - English
// ============================================================================
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
                "input-type": "text",
                "max-length": 120,
                "error-message": "Enter your name"
              },
              {
                type: "PhoneNumber",
                name: "mobile",
                label: "Mobile (10-digit)",
                required: true,
                "error-message": "Enter a valid mobile number"
              },
              {
                type: "SingleSelect",
                name: "best_time",
                label: "Best Time to Call",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "morning", title: "Morning" },
                    { id: "afternoon", title: "Afternoon" },
                    { id: "evening", title: "Evening" }
                  ]
                }
              },
              {
                type: "SingleSelect",
                name: "topic",
                label: "Topic",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "survey", title: "Site Survey" },
                    { id: "general", title: "General Enquiry" }
                  ]
                }
              },
              {
                type: "TextArea",
                name: "notes",
                label: "Notes (optional)",
                required: false,
                "max-length": 400
              }
            ],
            actions: {
              submit: {
                label: "Submit",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_callback_form"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "CALLBACK_SUCCESS",
      title: "Thank you!",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "Your callback request has been logged. We will contact you at your preferred time."
          }
        ]
      }
    }
  ]
};

// ============================================================================
// CALLBACK FLOW (Request Callback) - Hindi
// ============================================================================
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
      title: "कॉल-बैक अनुरोध",
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
                "input-type": "text",
                "max-length": 120,
                "error-message": "अपना नाम दर्ज करें"
              },
              {
                type: "PhoneNumber",
                name: "mobile",
                label: "मोबाइल (10-अंक)",
                required: true,
                "error-message": "वैध मोबाइल नंबर दर्ज करें"
              },
              {
                type: "SingleSelect",
                name: "best_time",
                label: "कॉल करने का सबसे अच्छा समय",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "morning", title: "सुबह" },
                    { id: "afternoon", title: "दोपहर" },
                    { id: "evening", title: "शाम" }
                  ]
                }
              },
              {
                type: "SingleSelect",
                name: "topic",
                label: "विषय",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "survey", title: "साइट सर्वे" },
                    { id: "general", title: "सामान्य पूछताछ" }
                  ]
                }
              },
              {
                type: "TextArea",
                name: "notes",
                label: "नोट्स (वैकल्पिक)",
                required: false,
                "max-length": 400
              }
            ],
            actions: {
              submit: {
                label: "सबमिट करें",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_callback_form"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "CALLBACK_SUCCESS",
      title: "धन्यवाद!",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "आपका कॉल-बैक अनुरोध दर्ज कर लिया गया है। हम आपके पसंदीदा समय पर आपसे संपर्क करेंगे।"
          }
        ]
      }
    }
  ]
};

// ============================================================================
// TRUST FLOW (Why Sunshine Power?) - English
// ============================================================================
export const TRUST_FLOW: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    TRUST_MENU: ["TRUST_RESULT"],
    TRUST_RESULT: []
  },
  screens: [
    {
      id: "TRUST_MENU",
      title: "Why Sunshine Power?",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "We are a PM Surya Ghar registered vendor and Class-B Electrical Contractor. We use ALMM/BIS-compliant modules. (Subsidy as per portal; subject to eligibility & updates.)"
          },
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "SingleSelect",
                name: "topic",
                label: "Choose what you'd like to see",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "credentials", title: "Credentials & Licenses" },
                    { id: "warranty", title: "Warranties & Materials" },
                    { id: "installs", title: "Recent Installs & Coverage" }
                  ]
                }
              }
            ],
            actions: {
              submit: {
                label: "Show",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "show_trust_topic"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "TRUST_RESULT",
      title: "Details",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "Here are the highlights you requested. Ready to proceed? Book a site survey in under a minute."
          },
          {
            type: "Form",
            name: "cta",
            children: [],
            actions: {
              submit: {
                label: "Book Site Survey",
                "on-click-action": {
                  name: "navigate",
                  payload: {
                    screen: "SURVEY_FORM"
                  }
                }
              }
            }
          }
        ]
      }
    }
  ]
};

// ============================================================================
// TRUST FLOW (Why Sunshine Power?) - Hindi
// ============================================================================
export const TRUST_FLOW_HI: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    TRUST_MENU: ["TRUST_RESULT"],
    TRUST_RESULT: []
  },
  screens: [
    {
      id: "TRUST_MENU",
      title: "क्यों Sunshine Power?",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "हम PM सूर्य घर पंजीकृत विक्रेता और Class-B Electrical Contractor हैं। हम ALMM/BIS-अनुपालन मॉड्यूल का उपयोग करते हैं। (सब्सिडी पोर्टल के अनुसार; पात्रता और अपडेट के अधीन।)"
          },
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "SingleSelect",
                name: "topic",
                label: "चुनें कि आप क्या देखना चाहते हैं",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "credentials", title: "प्रमाणपत्र और लाइसेंस" },
                    { id: "warranty", title: "वारंटी और सामग्री" },
                    { id: "installs", title: "हालिया इंस्टॉल और कवरेज" }
                  ]
                }
              }
            ],
            actions: {
              submit: {
                label: "दिखाएं",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "show_trust_topic"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "TRUST_RESULT",
      title: "विवरण",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "यहां आपके द्वारा अनुरोधित मुख्य बातें हैं। आगे बढ़ने के लिए तैयार हैं? 1 मिनट से कम में साइट सर्वे बुक करें।"
          },
          {
            type: "Form",
            name: "cta",
            children: [],
            actions: {
              submit: {
                label: "साइट सर्वे बुक करें",
                "on-click-action": {
                  name: "navigate",
                  payload: {
                    screen: "SURVEY_FORM"
                  }
                }
              }
            }
          }
        ]
      }
    }
  ]
};

// ============================================================================
// ELIGIBILITY FLOW (Check Eligibility) - English
// ============================================================================
export const ELIGIBILITY_FLOW: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    ELIG_FORM: ["ELIG_RESULT"],
    ELIG_RESULT: []
  },
  screens: [
    {
      id: "ELIG_FORM",
      title: "Check Eligibility",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "NumberInput",
                name: "avg_bill",
                label: "Avg Monthly Bill (₹)",
                required: true
              }
            ],
            actions: {
              submit: {
                label: "Get Result",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "eligibility_check"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "ELIG_RESULT",
      title: "Suggested Capacity",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "Based on your inputs, here's a suggested kW range and next steps. Subsidy as per PM Surya Ghar portal; subject to eligibility & updates."
          },
          {
            type: "Form",
            name: "cta",
            children: [],
            actions: {
              submit: {
                label: "Book Site Survey",
                "on-click-action": {
                  name: "navigate",
                  payload: {
                    screen: "SURVEY_FORM"
                  }
                }
              }
            }
          }
        ]
      }
    }
  ]
};

// ============================================================================
// ELIGIBILITY FLOW (Check Eligibility) - Hindi
// ============================================================================
export const ELIGIBILITY_FLOW_HI: WhatsAppFlow = {
  version: "7.2",
  data_api_version: "3.0",
  routing_model: {
    ELIG_FORM: ["ELIG_RESULT"],
    ELIG_RESULT: []
  },
  screens: [
    {
      id: "ELIG_FORM",
      title: "पात्रता जांचें",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Form",
            name: "form",
            children: [
              {
                type: "NumberInput",
                name: "avg_bill",
                label: "औसत मासिक बिल (₹)",
                required: true
              }
            ],
            actions: {
              submit: {
                label: "परिणाम प्राप्त करें",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "eligibility_check"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "ELIG_RESULT",
      title: "सुझाई गई क्षमता",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "आपके इनपुट के आधार पर, यहां एक सुझाई गई kW रेंज और अगले कदम हैं। सब्सिडी PM सूर्य घर पोर्टल के अनुसार; पात्रता और अपडेट के अधीन।"
          },
          {
            type: "Form",
            name: "cta",
            children: [],
            actions: {
              submit: {
                label: "साइट सर्वे बुक करें",
                "on-click-action": {
                  name: "navigate",
                  payload: {
                    screen: "SURVEY_FORM"
                  }
                }
              }
            }
          }
        ]
      }
    }
  ]
};

// Legacy flows kept for backwards compatibility with existing price/service flows
// These will be phased out in favor of the new simplified flows above

// Price Flow - English
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
      title: "Get Price Estimate",
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
                "input-type": "text",
                "max-length": 120,
                "error-message": "Please enter your name"
              },
              {
                type: "PhoneNumber",
                name: "mobile",
                label: "Mobile",
                required: true,
                "error-message": "Enter a valid mobile number"
              },
              {
                type: "TextArea",
                name: "address",
                label: "Address",
                required: false,
                "max-length": 400
              },
              {
                type: "TextInput",
                name: "village",
                label: "Village/Town",
                required: false,
                "input-type": "text"
              },
              {
                type: "NumberInput",
                name: "avg_bill",
                label: "Avg Monthly Bill (₹)",
                required: true
              }
            ],
            actions: {
              submit: {
                label: "Submit",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_price_form"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "PRICE_SUCCESS",
      title: "Thank you!",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "Your price estimate request has been received. Our team will contact you with a customized quote."
          }
        ]
      }
    }
  ]
};

// Price Flow - Hindi
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
      title: "मूल्य अनुमान प्राप्त करें",
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
                "input-type": "text",
                "max-length": 120,
                "error-message": "कृपया अपना नाम दर्ज करें"
              },
              {
                type: "PhoneNumber",
                name: "mobile",
                label: "मोबाइल",
                required: true,
                "error-message": "वैध मोबाइल नंबर दर्ज करें"
              },
              {
                type: "TextArea",
                name: "address",
                label: "पता",
                required: false,
                "max-length": 400
              },
              {
                type: "TextInput",
                name: "village",
                label: "गाँव/कस्बा",
                required: false,
                "input-type": "text"
              },
              {
                type: "NumberInput",
                name: "avg_bill",
                label: "औसत मासिक बिल (₹)",
                required: true
              }
            ],
            actions: {
              submit: {
                label: "सबमिट करें",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_price_form"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "PRICE_SUCCESS",
      title: "धन्यवाद!",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "आपका मूल्य अनुमान अनुरोध प्राप्त हो गया है। हमारी टीम एक कस्टमाइज्ड उद्धरण के साथ आपसे संपर्क करेगी।"
          }
        ]
      }
    }
  ]
};

// Service Flow - English
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
      title: "Request Service",
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
                "input-type": "text",
                "max-length": 120,
                "error-message": "Please enter your name"
              },
              {
                type: "PhoneNumber",
                name: "mobile",
                label: "Mobile",
                required: true,
                "error-message": "Enter a valid mobile number"
              },
              {
                type: "TextArea",
                name: "address",
                label: "Address",
                required: false,
                "max-length": 400
              },
              {
                type: "TextInput",
                name: "village",
                label: "Village/Town",
                required: false,
                "input-type": "text"
              },
              {
                type: "SingleSelect",
                name: "issue_type",
                label: "Issue Type",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "installation", title: "Installation" },
                    { id: "maintenance", title: "Maintenance" },
                    { id: "repair", title: "Repair" },
                    { id: "other", title: "Other" }
                  ]
                }
              },
              {
                type: "TextArea",
                name: "description",
                label: "Description",
                required: true,
                "max-length": 400
              }
            ],
            actions: {
              submit: {
                label: "Submit",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_service_form"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "SERVICE_SUCCESS",
      title: "Thank you!",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "Your service request has been logged. Our team will contact you shortly to schedule."
          }
        ]
      }
    }
  ]
};

// Service Flow - Hindi
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
      title: "सेवा अनुरोध",
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
                "input-type": "text",
                "max-length": 120,
                "error-message": "कृपया अपना नाम दर्ज करें"
              },
              {
                type: "PhoneNumber",
                name: "mobile",
                label: "मोबाइल",
                required: true,
                "error-message": "वैध मोबाइल नंबर दर्ज करें"
              },
              {
                type: "TextArea",
                name: "address",
                label: "पता",
                required: false,
                "max-length": 400
              },
              {
                type: "TextInput",
                name: "village",
                label: "गाँव/कस्बा",
                required: false,
                "input-type": "text"
              },
              {
                type: "SingleSelect",
                name: "issue_type",
                label: "समस्या का प्रकार",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "installation", title: "स्थापना" },
                    { id: "maintenance", title: "रखरखाव" },
                    { id: "repair", title: "मरम्मत" },
                    { id: "other", title: "अन्य" }
                  ]
                }
              },
              {
                type: "TextArea",
                name: "description",
                label: "विवरण",
                required: true,
                "max-length": 400
              }
            ],
            actions: {
              submit: {
                label: "सबमिट करें",
                "on-click-action": {
                  name: "data_exchange",
                  payload: {
                    op: "submit_service_form"
                  }
                }
              }
            }
          }
        ]
      }
    },
    {
      id: "SERVICE_SUCCESS",
      title: "धन्यवाद!",
      layout: {
        type: "SingleColumnLayout",
        children: [
          {
            type: "Description",
            text: "आपका सेवा अनुरोध दर्ज कर लिया गया है। हमारी टीम शेड्यूल करने के लिए जल्द ही आपसे संपर्क करेगी।"
          }
        ]
      }
    }
  ]
};

// ============================================================================
// ALL_FLOWS Export - For routes.ts endpoint mapping
// ============================================================================
export const ALL_FLOWS = {
  // New simplified flows
  SURVEY: SURVEY_FLOW,
  SURVEY_HI: SURVEY_FLOW_HI,
  CALLBACK: CALLBACK_FLOW,
  CALLBACK_HI: CALLBACK_FLOW_HI,
  TRUST: TRUST_FLOW,
  TRUST_HI: TRUST_FLOW_HI,
  ELIGIBILITY: ELIGIBILITY_FLOW,
  ELIGIBILITY_HI: ELIGIBILITY_FLOW_HI,
  // Legacy flows (for backwards compatibility)
  PRICE: PRICE_FLOW,
  PRICE_HI: PRICE_FLOW_HI,
  SERVICE: SERVICE_FLOW,
  SERVICE_HI: SERVICE_FLOW_HI
};
