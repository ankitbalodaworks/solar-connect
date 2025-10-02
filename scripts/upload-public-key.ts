import crypto from 'crypto';
import axios from 'axios';

async function uploadPublicKey() {
  try {
    console.log('🔐 Extracting public key from private key...');
    
    const privateKey = process.env.WHATSAPP_FLOW_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('WHATSAPP_FLOW_PRIVATE_KEY environment variable not set');
    }

    // Apply the PEM formatting fix
    let formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    if (formattedPrivateKey.startsWith('-----BEGIN PRIVATE KEY----- ')) {
      const parts = formattedPrivateKey.split(' ');
      const header = parts.slice(0, 3).join(' ');
      const footer = parts.slice(-3).join(' ');
      const base64Lines = parts.slice(3, -3);
      formattedPrivateKey = header + '\n' + base64Lines.join('\n') + '\n' + footer;
    }

    // Extract public key from private key
    const keyObject = crypto.createPrivateKey({
      key: formattedPrivateKey,
      format: 'pem'
    });

    const publicKey = crypto.createPublicKey(keyObject);
    const publicKeyPem = publicKey.export({ type: 'spki', format: 'pem' });

    console.log('\n📋 Public Key:');
    console.log(publicKeyPem);

    // Get WhatsApp credentials from environment
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      throw new Error('Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN environment variables');
    }

    console.log('\n📤 Uploading public key to Meta/WhatsApp...');
    console.log(`Phone Number ID: ${phoneNumberId}`);

    // Upload to WhatsApp Business API
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_encryption`,
      {
        business_public_key: publicKeyPem
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Public key uploaded successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n⏳ Wait 5-10 minutes for Meta to propagate the key, then test your flow endpoint.');

  } catch (error: any) {
    console.error('\n❌ Error uploading public key:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

uploadPublicKey();
