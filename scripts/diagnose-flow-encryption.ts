import axios from 'axios';

async function diagnoseFlowEncryption() {
  try {
    console.log('🔍 Diagnosing WhatsApp Flow Encryption Issue\n');
    console.log('='.repeat(70));
    
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const flowIds = [
      { name: 'SURVEY', id: process.env.WHATSAPP_FLOW_ID_SURVEY },
      { name: 'PRICE', id: process.env.WHATSAPP_FLOW_ID_PRICE },
      { name: 'SERVICE', id: process.env.WHATSAPP_FLOW_ID_SERVICE },
      { name: 'CALLBACK', id: process.env.WHATSAPP_FLOW_ID_CALLBACK },
    ];

    console.log(`\n📱 Current Phone Number ID: ${phoneNumberId}`);
    
    // Get encryption keys registered for this phone number
    console.log('\n🔐 Checking encryption keys registered for this phone number...');
    const encryptionResponse = await axios.get(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/whatsapp_business_encryption`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );
    
    if (encryptionResponse.data.data && encryptionResponse.data.data.length > 0) {
      console.log(`✅ Found ${encryptionResponse.data.data.length} encryption key(s) registered`);
      encryptionResponse.data.data.forEach((key: any, index: number) => {
        console.log(`\n  Key #${index + 1}:`);
        console.log(`    Status: ${key.business_public_key_signature_status}`);
        console.log(`    Public Key (first 60 chars): ${key.business_public_key.substring(0, 60)}...`);
      });
    } else {
      console.log('❌ No encryption keys registered for this phone number');
    }

    console.log('\n' + '='.repeat(70));
    console.log('📋 Checking which phone number each Flow is attached to...\n');

    for (const flow of flowIds) {
      try {
        // Get flow details
        const flowResponse = await axios.get(
          `https://graph.facebook.com/v21.0/${flow.id}?fields=name,status,whatsapp_business_account,application`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        console.log(`Flow: ${flow.name}`);
        console.log(`  ID: ${flow.id}`);
        console.log(`  Name: ${flowResponse.data.name}`);
        console.log(`  Status: ${flowResponse.data.status}`);
        
        if (flowResponse.data.whatsapp_business_account) {
          console.log(`  ✅ WABA ID: ${flowResponse.data.whatsapp_business_account.id}`);
        }
        
        if (flowResponse.data.application) {
          console.log(`  App ID: ${flowResponse.data.application}`);
        }
        console.log('');

      } catch (error: any) {
        console.log(`Flow: ${flow.name}`);
        console.log(`  ❌ Error: ${error.response?.data?.error?.message || error.message}`);
        console.log('');
      }
    }

    console.log('='.repeat(70));
    console.log('\n💡 DIAGNOSIS:\n');
    console.log('The OAEP decryption error means one of these issues:');
    console.log('1. ❌ The Flow is using a different phone number than', phoneNumberId);
    console.log('2. ❌ The encryption key was registered for a different phone number');
    console.log('3. ❌ Multiple phone numbers in the same WABA have different keys\n');
    console.log('SOLUTION:');
    console.log('- Each Flow must be associated with phone number:', phoneNumberId);
    console.log('- Or re-register the encryption key for ALL phone numbers in the WABA');

  } catch (error: any) {
    console.error('\n❌ Error during diagnosis:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

diagnoseFlowEncryption();
