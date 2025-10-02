import axios from 'axios';

const USER_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEApW58oq+x/F4c9fWrL1Qc
rICMvHpghOy+BBPXpkScSt1H2r2AY0VvbUYo892lVbQlH4WXAmWKB9DEGLgApl+Z
7bf2GxjlSifE4EKI4gMS2hM2Mx+H/p0QgKa1D2FQHbtAz8MYcJXSxypjLIzFMo6J
cBDx6mvUNJ/2GXxmBszGD5KS/zLt9pHugOZ9LCC5lE9Zu1/AyZBVu4a8vggay+K3
rP5Q4mr5F+mfc/ZZHOZkDlxtVxTqQMyZEPmWOY6otjL+nlXmZmnA51VYAVeb2TLM
j3yGMRLiFDWRJiG5KtXwMCSQrxN6wxNHybWnZiG9R7C5J8NOAhc/b12dLrSexwtQ
5wIDAQAB
-----END PUBLIC KEY-----`;

async function uploadUserPublicKey() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('❌ Missing required environment variables:');
    console.error('   WHATSAPP_PHONE_NUMBER_ID:', phoneNumberId ? '✓' : '✗');
    console.error('   WHATSAPP_ACCESS_TOKEN:', accessToken ? '✓' : '✗');
    process.exit(1);
  }

  console.log('📤 Uploading User-Provided Public Key to Meta...');
  console.log('Phone Number ID:', phoneNumberId);
  console.log('');

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_encryption`,
      {
        business_public_key: USER_PUBLIC_KEY
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Successfully uploaded user public key to Meta!');
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

    if (uploadedKey === USER_PUBLIC_KEY) {
      console.log('✅ Verification SUCCESS! Key matches.');
      console.log('Status:', status);
    } else {
      console.log('⚠️  Warning: Uploaded key might not match exactly');
      console.log('Status:', status);
    }

    console.log('');
    console.log('⚠️  IMPORTANT: Make sure your WHATSAPP_FLOW_PRIVATE_KEY matches this public key!');
    console.log('   Update both Replit Secrets and Render Environment Variables.');

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

uploadUserPublicKey();
