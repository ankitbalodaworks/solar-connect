import crypto from 'crypto';
import axios from 'axios';

async function verifyPublicKey() {
  try {
    console.log('🔐 Extracting our public key from private key...');
    
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

    // Extract our public key
    const keyObject = crypto.createPrivateKey({
      key: formattedPrivateKey,
      format: 'pem'
    });

    const ourPublicKey = crypto.createPublicKey(keyObject);
    const ourPublicKeyPem = ourPublicKey.export({ type: 'spki', format: 'pem' });

    console.log('\n📋 Our Public Key:');
    console.log(ourPublicKeyPem);

    // Get WhatsApp credentials
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      throw new Error('Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN environment variables');
    }

    console.log('\n🔍 Checking what public key Meta has registered...');
    console.log(`Phone Number ID: ${phoneNumberId}`);

    // Get the registered key from Meta
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_encryption`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    console.log('\n✅ Retrieved registered key from Meta!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

    const metaPublicKey = response.data.data?.[0]?.business_public_key;
    const signatureStatus = response.data.data?.[0]?.business_public_key_signature_status;
    
    if (metaPublicKey) {
      console.log('\n🔐 Signature Status:', signatureStatus);
      console.log('\n📋 Meta\'s Registered Public Key:');
      console.log(metaPublicKey);

      // Compare keys
      const ourKeyNormalized = ourPublicKeyPem.trim();
      const metaKeyNormalized = metaPublicKey.trim();

      if (ourKeyNormalized === metaKeyNormalized) {
        console.log('\n✅ KEYS MATCH! Our public key matches Meta\'s registered key.');
        console.log('The encryption should work correctly.');
      } else {
        console.log('\n❌ KEYS DO NOT MATCH!');
        console.log('Our public key is DIFFERENT from Meta\'s registered key.');
        console.log('\n🔧 You need to re-upload the correct public key using:');
        console.log('   tsx scripts/upload-public-key.ts');
      }
    } else {
      console.log('\n⚠️  No public key is registered with Meta!');
      console.log('You need to upload your public key using:');
      console.log('   tsx scripts/upload-public-key.ts');
    }

  } catch (error: any) {
    console.error('\n❌ Error verifying public key:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

verifyPublicKey();
