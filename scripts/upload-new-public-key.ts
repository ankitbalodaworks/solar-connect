import axios from 'axios';

const NEW_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx76M48SOVTb0Dkot7anr
/l5jff+2WP3YWr2YRnM2PTpNe4KARYRgmtG9HlpvVTic9lH3KGj4gSr0sKkftgKd
n6K6XwSff0W6/4FJRfDpfI3+0vIZ4Co0ZIdvAjdw9EYx0KxHIBsaXcx9wcreLz9k
vvhZfEPg92LcQk71AlYjuRI60bn4BflowUITIfzDzdTQUVDLV4ZSsQai7X0rTieV
HTa8oPqf7996BrY9W9x70lNntXIfc+UR4XJW9/n0XYv6Y9M9PkIc9ji9e55hPEdJ
LLmZ8vseyUhXvVFPGe5Zbw8CWulf6x/hMpUWUCWftISPho3HFkGmEJjBD9lxTOG1
LwIDAQAB
-----END PUBLIC KEY-----`;

async function uploadNewPublicKey() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('❌ Missing required environment variables:');
    console.error('   WHATSAPP_PHONE_NUMBER_ID:', phoneNumberId ? '✓' : '✗');
    console.error('   WHATSAPP_ACCESS_TOKEN:', accessToken ? '✓' : '✗');
    process.exit(1);
  }

  console.log('📤 Uploading NEW Public Key to Meta...');
  console.log('Phone Number ID:', phoneNumberId);
  console.log('');

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_encryption`,
      {
        business_public_key: NEW_PUBLIC_KEY
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Successfully uploaded NEW public key to Meta!');
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

    if (uploadedKey === NEW_PUBLIC_KEY) {
      console.log('✅ Verification SUCCESS! Key matches.');
      console.log('Status:', status);
    } else {
      console.log('⚠️  Warning: Uploaded key might not match exactly');
      console.log('Status:', status);
    }

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

uploadNewPublicKey();
