#!/usr/bin/env tsx
// WhatsApp Flow Management CLI
// Usage: tsx scripts/manage-flows.ts [command]

import { flowManager } from "../server/whatsappFlowManager";
import { storage } from "../server/storage";
import { config } from "dotenv";

// Load environment variables
config();

// ANSI color codes for better output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function printHeader(text: string) {
  console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}`);
}

function printSuccess(text: string) {
  console.log(`${colors.green}✓ ${text}${colors.reset}`);
}

function printError(text: string) {
  console.log(`${colors.red}✗ ${text}${colors.reset}`);
}

function printWarning(text: string) {
  console.log(`${colors.yellow}⚠ ${text}${colors.reset}`);
}

function printInfo(text: string) {
  console.log(`${colors.cyan}ℹ ${text}${colors.reset}`);
}

async function syncFlows() {
  printHeader("Syncing WhatsApp Flows");
  console.log("This will create or update all flows with Meta...\n");

  const result = await flowManager.syncAllFlows();

  console.log("\n" + "=".repeat(50));
  printHeader("Sync Results");
  
  if (result.success) {
    printSuccess(`Sync completed successfully!`);
  } else {
    printWarning(`Sync completed with errors`);
  }

  console.log(`\nCreated: ${colors.green}${result.created}${colors.reset}`);
  console.log(`Updated: ${colors.blue}${result.updated}${colors.reset}`);
  console.log(`Failed: ${colors.red}${result.failed}${colors.reset}`);

  if (result.errors.length > 0) {
    console.log("\n" + colors.red + "Errors:" + colors.reset);
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  }
}

async function listFlows() {
  printHeader("WhatsApp Flows Status");
  
  const summary = await flowManager.getFlowStatusSummary();
  
  console.log(`\nTotal Flows: ${colors.bright}${summary.total}${colors.reset}`);
  console.log(`Published: ${colors.green}${summary.published}${colors.reset}`);
  console.log(`Draft: ${colors.yellow}${summary.draft}${colors.reset}`);
  console.log(`Errors: ${colors.red}${summary.error}${colors.reset}`);

  console.log("\n" + "=".repeat(80));
  console.log(`${"Flow Type".padEnd(15)} ${"Language".padEnd(10)} ${"Status".padEnd(12)} ${"Flow ID".padEnd(25)} ${"Version"}`);
  console.log("=".repeat(80));

  summary.flows.forEach((flow) => {
    const statusColor = 
      flow.status === "published" ? colors.green :
      flow.status === "draft" ? colors.yellow :
      flow.status === "error" ? colors.red : colors.reset;

    const flowType = flow.flowType.padEnd(15);
    const language = (flow.language === "hi" ? "Hindi" : "English").padEnd(10);
    const status = flow.status.padEnd(12);
    const flowId = (flow.metaFlowId || "Not created").padEnd(25);
    const version = `v${flow.version}`;

    console.log(`${flowType} ${language} ${statusColor}${status}${colors.reset} ${flowId} ${version}`);
    
    if (flow.errorMessage) {
      console.log(`  ${colors.red}Error: ${flow.errorMessage}${colors.reset}`);
    }
  });
}

async function checkConfig() {
  printHeader("Checking Configuration");

  const hasAccessToken = !!process.env.WHATSAPP_ACCESS_TOKEN;
  const hasBusinessAccount = !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const hasPrivateKey = !!process.env.WHATSAPP_FLOW_PRIVATE_KEY;
  const hasAppId = !!process.env.WHATSAPP_APP_ID;

  console.log("\nRequired Environment Variables:");
  
  if (hasAccessToken) {
    printSuccess("WHATSAPP_ACCESS_TOKEN is configured");
  } else {
    printError("WHATSAPP_ACCESS_TOKEN is missing");
  }

  if (hasBusinessAccount) {
    printSuccess("WHATSAPP_BUSINESS_ACCOUNT_ID is configured");
  } else {
    printError("WHATSAPP_BUSINESS_ACCOUNT_ID is missing");
  }

  if (hasPrivateKey) {
    printSuccess("WHATSAPP_FLOW_PRIVATE_KEY is configured");
  } else {
    printError("WHATSAPP_FLOW_PRIVATE_KEY is missing");
  }

  if (hasAppId) {
    printSuccess("WHATSAPP_APP_ID is configured");
  } else {
    printWarning("WHATSAPP_APP_ID is missing (optional)");
  }

  console.log("\nLegacy Flow ID Environment Variables (optional, for backward compatibility):");
  
  const legacyFlowIds = [
    "WHATSAPP_FLOW_ID_SURVEY",
    "WHATSAPP_FLOW_ID_SURVEY_HI",
    "WHATSAPP_FLOW_ID_CALLBACK",
    "WHATSAPP_FLOW_ID_CALLBACK_HI",
    "WHATSAPP_FLOW_ID_TRUST",
    "WHATSAPP_FLOW_ID_TRUST_HI",
    "WHATSAPP_FLOW_ID_ELIGIBILITY",
    "WHATSAPP_FLOW_ID_ELIGIBILITY_HI",
    "WHATSAPP_FLOW_ID_PRICE",
    "WHATSAPP_FLOW_ID_PRICE_HI",
    "WHATSAPP_FLOW_ID_SERVICE",
    "WHATSAPP_FLOW_ID_SERVICE_HI",
  ];

  let legacyCount = 0;
  legacyFlowIds.forEach((varName) => {
    if (process.env[varName]) {
      legacyCount++;
    }
  });

  if (legacyCount > 0) {
    printInfo(`${legacyCount} legacy flow IDs configured (will be migrated to database)`);
  } else {
    printInfo("No legacy flow IDs configured (flows will be created fresh)");
  }

  const allRequired = hasAccessToken && hasBusinessAccount && hasPrivateKey;
  
  if (allRequired) {
    console.log("\n" + colors.green + "✓ All required variables are configured. Ready to sync flows!" + colors.reset);
  } else {
    console.log("\n" + colors.red + "✗ Missing required configuration. Please set the environment variables above." + colors.reset);
  }

  return allRequired;
}

async function publishFlow(flowKey: string) {
  printHeader(`Publishing Flow: ${flowKey}`);
  
  const flow = await storage.getWhatsappFlow(flowKey);
  
  if (!flow) {
    printError(`Flow not found: ${flowKey}`);
    return;
  }

  if (!flow.metaFlowId) {
    printError("Flow has not been created in WhatsApp yet. Run 'sync' first.");
    return;
  }

  if (flow.status === "published") {
    printWarning("Flow is already published");
    return;
  }

  const result = await flowManager.publishFlow(flow.metaFlowId);
  
  if (result.success) {
    await storage.updateWhatsappFlow(flowKey, {
      status: "published",
      lastSyncedAt: new Date()
    });
    printSuccess(`Flow ${flowKey} published successfully!`);
  } else {
    printError(`Failed to publish flow: ${result.error}`);
  }
}

async function showHelp() {
  printHeader("WhatsApp Flow Management CLI");
  
  console.log("\nUsage: tsx scripts/manage-flows.ts [command] [options]");
  
  console.log("\nCommands:");
  console.log("  check       Check environment configuration");
  console.log("  list        List all flows and their status");
  console.log("  sync        Sync all flows with Meta (create/update)");
  console.log("  publish     Publish a specific flow");
  console.log("  help        Show this help message");
  
  console.log("\nExamples:");
  console.log("  tsx scripts/manage-flows.ts check");
  console.log("  tsx scripts/manage-flows.ts list");
  console.log("  tsx scripts/manage-flows.ts sync");
  console.log("  tsx scripts/manage-flows.ts publish survey_en");
  
  console.log("\nFlow Types:");
  console.log("  survey      Site survey booking");
  console.log("  callback    Callback request");
  console.log("  trust       Trust building information");
  console.log("  eligibility Eligibility check");
  console.log("  price       Price estimate (legacy)");
  console.log("  service     Service request (legacy)");
  
  console.log("\nFlow Keys (for publish command):");
  console.log("  survey_en, survey_hi");
  console.log("  callback_en, callback_hi");
  console.log("  trust_en, trust_hi");
  console.log("  eligibility_en, eligibility_hi");
  console.log("  price_en, price_hi");
  console.log("  service_en, service_hi");
}

// Main CLI logic
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case "check":
        await checkConfig();
        break;
      
      case "list":
        await listFlows();
        break;
      
      case "sync":
        const canSync = await checkConfig();
        if (canSync) {
          await syncFlows();
        } else {
          printError("Cannot sync flows due to missing configuration");
        }
        break;
      
      case "publish":
        if (args.length === 0) {
          printError("Please specify a flow key to publish");
          console.log("Example: tsx scripts/manage-flows.ts publish survey_en");
        } else {
          await publishFlow(args[0]);
        }
        break;
      
      case "help":
      case undefined:
        await showHelp();
        break;
      
      default:
        printError(`Unknown command: ${command}`);
        await showHelp();
        process.exit(1);
    }
  } catch (error) {
    printError(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the CLI
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});