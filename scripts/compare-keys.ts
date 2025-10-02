import crypto from 'crypto';
import axios from 'axios';

async function compareKeys() {
  console.log('🔍 Comparing Local vs Meta Public Keys\n');
  console.log('='.repeat(70));

  // 1. Get our local private key
  const privateKey = process.env.WHATSAPP_FLOW_PRIVATE_KEY;
  if (!privateKey) {
    console.log('❌ ERROR: WHATSAPP_FLOW_PRIVATE_KEY not found');
    process.exit(1);
  }

  // Format the private key
  let formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
  if (formattedPrivateKey.startsWith('-----BEGIN PRIVATE KEY----- ')) {
    const parts = formattedPrivateKey.split(' ');
    const header = parts.slice(0, 3).join(' ');
    const footer = parts.slice(-3).join(' ');
    const base64Lines = parts.slice(3, -3);
    formattedPrivateKey = header + '\n' + base64Lines.join('\n') + '\n' + footer;
  }

  // 2. Extract our public key
  const rsaPrivateKey = crypto.createPrivateKey({
    key: formattedPrivateKey,
    format: 'pem'
  });
  const rsaPublicKey = crypto.createPublicKey(rsaPrivateKey);
  const ourPublicKeyPem = rsaPublicKey.export({ type: 'spki', format: 'pem' }) as string;
  
  console.log('\n📋 Our Local Public Key (derived from private key):');
  console.log(ourPublicKeyPem);

  // 3. Fetch Meta's registered public key
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.log('\n❌ ERROR: Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN');
    process.exit(1);
  }

  try {
    console.log('\n🌐 Fetching public key from Meta...');
    console.log('Phone Number ID:', phoneNumberId);

    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_encryption`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const metaData = response.data.data?.[0] || response.data[0];
    if (!metaData || !metaData.business_public_key) {
      console.log('\n❌ No business_public_key found in response!');
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      return;
    }
    
    const metaPublicKey = metaData.business_public_key;
    const metaStatus = metaData.business_public_key_signature_status;
    
    console.log('\n📋 Meta\'s Registered Public Key:');
    console.log(metaPublicKey);
    console.log('\nStatus:', metaStatus);

    // 4. Compare the keys
    console.log('\n' + '='.repeat(70));
    console.log('🔍 COMPARISON RESULT:');
    console.log('='.repeat(70));

    const ourKeyNormalized = ourPublicKeyPem.replace(/\s+/g, '');
    const metaKeyNormalized = metaPublicKey.replace(/\s+/g, '');

    if (ourKeyNormalized === metaKeyNormalized) {
      console.log('✅ KEYS MATCH! Meta has the correct public key.');
      console.log('\nThe issue must be something else. Possible causes:');
      console.log('1. Meta is still propagating the key (wait 10-15 more minutes)');
      console.log('2. Private key on Render is different from local');
      console.log('3. Flow is attached to a different phone number');
    } else {
      console.log('❌ KEYS DO NOT MATCH! Meta has a DIFFERENT public key!');
      console.log('\nThis explains the decryption errors.');
      console.log('\nACTION REQUIRED:');
      console.log('1. Run: tsx scripts/upload-public-key.ts');
      console.log('2. Wait 15-20 minutes for Meta propagation');
      console.log('3. Test again');
    }

  } catch (error: any) {
    console.error('\n❌ Error fetching public key from Meta:', error.response?.data || error.message);
    console.log('\nMake sure:');
    console.log('1. Your access token is valid');
    console.log('2. Phone Number ID is correct');
    console.log('3. You have permissions to read encryption settings');
  }
}

compareKeys();
