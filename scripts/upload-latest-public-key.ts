import axios from 'axios';

const LATEST_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4etWEu8eHroq743qLkua
CnXv6eSADp73rqckt7Iru5uo+yvZ26K+w4ymWfCF7iAMJuys58AU1MpTXz20m9+C
rrMFA1P4p9LwnJ8Z4upe476qZ/U8VJJHVVVMGu23jtqLPjlsHiE5friybEfVgYkx
TJOzh4vtIQZnQmYrZreCpIupR/pTgvoKICjyQ9EGo9uejtO38IHdiLmxcxl3M9UN
VUJ1+aIVZcavITLXFsNJBEQTxyqG9O0bUjrdU3C6L1gSyaqxqQolXZQPq1QMTfWm
t3rBLz8H1dXW8yYWNc6AQwHAEVjeOe5KLW/yAIWs4vMKVCpNpobtIVYY84/7HSvD
SQIDAQAB
-----END PUBLIC KEY-----`;

async function uploadLatestPublicKey() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('❌ Missing required environment variables:');
    console.error('   WHATSAPP_PHONE_NUMBER_ID:', phoneNumberId ? '✓' : '✗');
    console.error('   WHATSAPP_ACCESS_TOKEN:', accessToken ? '✓' : '✗');
    process.exit(1);
  }

  console.log('📤 Uploading Latest Public Key to Meta...');
  console.log('Phone Number ID:', phoneNumberId);
  console.log('');

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_encryption`,
      {
        business_public_key: LATEST_PUBLIC_KEY
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Successfully uploaded public key to Meta!');
    console.log('Response:', response.data);
    console.log('');
    console.log('🔍 Verifying upload...');

    // Verify the upload
    const verifyResponse = await axios.get(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_encryption`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const uploadedKey = verifyResponse.data.data?.[0]?.business_public_key;
    const status = verifyResponse.data.data?.[0]?.business_public_key_signature_status;

    if (uploadedKey === LATEST_PUBLIC_KEY) {
      console.log('✅ Verification SUCCESS! Key matches.');
      console.log('Status:', status);
    } else {
      console.log('⚠️  Warning: Uploaded key might not match exactly');
      console.log('Status:', status);
    }

    console.log('');
    console.log('⚠️  IMPORTANT: Make sure your WHATSAPP_FLOW_PRIVATE_KEY environment variable');
    console.log('   contains the matching private key in both:');
    console.log('   1. Replit Secrets (🔒 icon)');
    console.log('   2. Render Environment Variables');

  } catch (error: any) {
    console.error('❌ Failed to upload public key:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

uploadLatestPublicKey();
