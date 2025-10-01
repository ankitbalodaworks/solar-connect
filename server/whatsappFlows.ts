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
                required: true,
                "max-length": 400
              },
              {
                type: "TextInput",
                name: "village",
                label: "Village/Town",
                required: true,
                "input-type": "text"
              },
              {
                type: "NumberInput",
                name: "avg_bill",
                label: "Avg Monthly Bill (₹)",
                required: true
              },
              {
                type: "SingleSelect",
                name: "phase",
                label: "Phase",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "1p", title: "1φ" },
                    { id: "3p", title: "3φ" }
                  ]
                }
              },
              {
                type: "SingleSelect",
                name: "roof_type",
                label: "Roof Type",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "rcc", title: "RCC" },
                    { id: "tin", title: "Tin/Sheet" },
                    { id: "other", title: "Other" }
                  ]
                }
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
                required: true,
                "max-length": 400
              },
              {
                type: "TextInput",
                name: "village",
                label: "Village/Town",
                required: true,
                "input-type": "text"
              },
              {
                type: "NumberInput",
                name: "avg_bill",
                label: "Avg Monthly Bill (₹)",
                required: true
              },
              {
                type: "NumberInput",
                name: "monthly_units",
                label: "Avg Monthly Units (kWh)",
                required: true
              },
              {
                type: "SingleSelect",
                name: "phase",
                label: "Phase",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "1p", title: "1φ" },
                    { id: "3p", title: "3φ" }
                  ]
                }
              },
              {
                type: "SingleSelect",
                name: "roof_type",
                label: "Roof Type",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "rcc", title: "RCC" },
                    { id: "tin", title: "Tin/Sheet" },
                    { id: "other", title: "Other" }
                  ]
                }
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
                required: true,
                "max-length": 400
              },
              {
                type: "TextInput",
                name: "village",
                label: "Village/Town",
                required: true,
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
                    { id: "inverter", title: "Inverter" },
                    { id: "panels", title: "Panels" },
                    { id: "wiring", title: "Wiring" },
                    { id: "meter", title: "Meter/Net-Meter" },
                    { id: "other", title: "Other" }
                  ]
                }
              },
              {
                type: "SingleSelect",
                name: "urgency",
                label: "Urgency",
                required: true,
                "data-source": {
                  type: "STATIC",
                  data: [
                    { id: "low", title: "Low" },
                    { id: "normal", title: "Normal" },
                    { id: "high", title: "High" }
                  ]
                }
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
                    { id: "site_survey", title: "Site Survey" },
                    { id: "price_estimate", title: "Price Estimate" },
                    { id: "maintenance", title: "Maintenance/Service" },
                    { id: "other", title: "Other" }
                  ]
                }
              },
              {
                type: "TextArea",
                name: "notes",
                label: "Notes (Optional)",
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
            text: "We'll call you at your preferred time."
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
  CALLBACK: CALLBACK_FLOW
};
