WhatsApp Flow JSON Definitions
================================

This folder contains 4 WhatsApp Flow JSON definitions ready to upload to Meta Business Manager:

1. SURVEY_FLOW.json - For booking site surveys (rooftop solar installation)
2. PRICE_FLOW.json - For getting price estimates
3. SERVICE_FLOW.json - For maintenance/service requests
4. CALLBACK_FLOW.json - For requesting callbacks

HOW TO UPLOAD TO META BUSINESS MANAGER:
----------------------------------------

1. Log into Meta Business Manager (business.facebook.com)

2. Navigate to WhatsApp Manager:
   - Select your business
   - Click on "WhatsApp Accounts" in the left menu
   - Select your WhatsApp Business Account

3. Create Flows:
   - Click on "Flows" in the left menu
   - Click "Create Flow"
   - Choose "Build from scratch"
   - Copy and paste the JSON content from each file
   - Save and publish the flow

4. After Publishing:
   - Copy the Flow ID (it looks like: 123456789012345)
   - Add it to your Replit Secrets:
     * WHATSAPP_FLOW_ID_SURVEY (from SURVEY_FLOW.json)
     * WHATSAPP_FLOW_ID_PRICE (from PRICE_FLOW.json)
     * WHATSAPP_FLOW_ID_SERVICE (from SERVICE_FLOW.json)
     * WHATSAPP_FLOW_ID_CALLBACK (from CALLBACK_FLOW.json)

5. Configure Data Exchange Endpoint:
   When creating each flow in Meta, you'll need to provide your data_exchange endpoint URL:
   https://your-replit-app.replit.app/api/whatsapp/data-exchange

IMPORTANT NOTES:
----------------
- Each flow must be reviewed and approved by Meta before it can be used
- The approval process typically takes 24-48 hours
- Make sure all 4 Flow IDs are added to your Replit Secrets before testing
- The data_exchange endpoint must be publicly accessible for Meta to validate

TECHNICAL DETAILS:
------------------
- Flow Version: 7.2
- Data API Version: 3.0
- All flows use data_exchange for form submission
- Each form has validation and required fields
- Success screens are displayed after submission
