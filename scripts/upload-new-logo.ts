import { WhatsAppService } from "../server/whatsapp";

const whatsappService = new WhatsAppService();

async function uploadNewLogo() {
  try {
    const filePath = "attached_assets/Logo 1_1759854892982.jpeg";
    const mimeType = "image/jpeg";

    console.log(`Uploading ${filePath} to Meta...`);
    
    const result = await whatsappService.uploadTemplateMedia(filePath, mimeType);
    
    if (result.success) {
      console.log("\n✅ Upload successful!");
      console.log("File handle:", result.mediaId);
      console.log("\nUpdate server/metaTemplates.ts with this handle:");
      console.log(`header_handle: ["${result.mediaId}"]`);
    } else {
      console.error("\n❌ Upload failed:", result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

uploadNewLogo();
