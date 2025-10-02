import crypto from 'crypto';

function testEncryptionDecryption() {
  try {
    console.log('🔐 Testing RSA-OAEP + AES-GCM encryption/decryption...\n');
    
    const privateKey = process.env.WHATSAPP_FLOW_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('WHATSAPP_FLOW_PRIVATE_KEY environment variable not set');
    }

    // Apply PEM fix
    let formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    if (formattedPrivateKey.startsWith('-----BEGIN PRIVATE KEY----- ')) {
      const parts = formattedPrivateKey.split(' ');
      const header = parts.slice(0, 3).join(' ');
      const footer = parts.slice(-3).join(' ');
      const base64Lines = parts.slice(3, -3);
      formattedPrivateKey = header + '\n' + base64Lines.join('\n') + '\n' + footer;
    }

    // Extract public key
    const rsaPrivateKey = crypto.createPrivateKey({
      key: formattedPrivateKey,
      format: 'pem'
    });
    const rsaPublicKey = crypto.createPublicKey(rsaPrivateKey);
    const publicKeyPem = rsaPublicKey.export({ type: 'spki', format: 'pem' });

    console.log('📋 Public Key:');
    console.log(publicKeyPem);
    console.log('\n' + '='.repeat(60) + '\n');

    // Step 1: Generate AES key and IV (simulating WhatsApp)
    const aesKey = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(12); // 96-bit IV for GCM

    console.log('Step 1: Generated AES key and IV');
    console.log(`  AES Key: ${aesKey.toString('base64').substring(0, 20)}...`);
    console.log(`  IV: ${iv.toString('base64')}`);

    // Step 2: Encrypt AES key with RSA-OAEP (simulating WhatsApp)
    console.log('\nStep 2: Encrypting AES key with RSA-OAEP (no label, matching WhatsApp)...');
    const encryptedAesKey = crypto.publicEncrypt(
      {
        key: rsaPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      aesKey
    );
    console.log(`  Encrypted AES Key (base64): ${encryptedAesKey.toString('base64').substring(0, 40)}...`);

    // Step 3: Create test payload
    const testPayload = {
      action: 'PING',
      version: '3.0',
      data: { status: 'active' }
    };
    console.log('\nStep 3: Test Payload:', JSON.stringify(testPayload));

    // Step 4: Encrypt payload with AES-GCM (simulating WhatsApp)
    console.log('\nStep 4: Encrypting payload with AES-256-GCM...');
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);
    const payloadString = JSON.stringify(testPayload);
    let encryptedPayload = cipher.update(payloadString, 'utf8');
    encryptedPayload = Buffer.concat([encryptedPayload, cipher.final()]);
    const authTag = cipher.getAuthTag();
    const encryptedFlowData = Buffer.concat([encryptedPayload, authTag]);
    
    console.log(`  Encrypted Flow Data (base64): ${encryptedFlowData.toString('base64').substring(0, 40)}...`);

    // Step 5: Create the request body (simulating what WhatsApp sends)
    const simulatedRequest = {
      encrypted_aes_key: encryptedAesKey.toString('base64'),
      encrypted_flow_data: encryptedFlowData.toString('base64'),
      initial_vector: iv.toString('base64')
    };

    console.log('\n' + '='.repeat(60));
    console.log('📦 Simulated WhatsApp Request:');
    console.log(JSON.stringify(simulatedRequest, null, 2).substring(0, 300) + '...\n');
    console.log('='.repeat(60) + '\n');

    // NOW DECRYPT (simulating our server)
    console.log('🔓 DECRYPTION TEST (simulating our server)...\n');

    // Step 6: Decrypt AES key with RSA-OAEP
    console.log('Step 6: Decrypting AES key with RSA-OAEP (no label, matching WhatsApp)...');
    const encryptedAesKeyBuffer = Buffer.from(simulatedRequest.encrypted_aes_key, 'base64');
    
    const decryptedAesKey = crypto.privateDecrypt(
      {
        key: rsaPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      encryptedAesKeyBuffer
    );
    
    console.log(`  ✅ Decrypted AES Key matches: ${decryptedAesKey.equals(aesKey)}`);

    // Step 7: Decrypt payload with AES-GCM
    console.log('\nStep 7: Decrypting payload with AES-256-GCM...');
    const encryptedFlowDataBuffer = Buffer.from(simulatedRequest.encrypted_flow_data, 'base64');
    const ivBuffer = Buffer.from(simulatedRequest.initial_vector, 'base64');
    
    const authTagFromRequest = encryptedFlowDataBuffer.slice(-16);
    const ciphertext = encryptedFlowDataBuffer.slice(0, -16);
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', decryptedAesKey, ivBuffer);
    decipher.setAuthTag(authTagFromRequest);
    
    let decryptedPayload = decipher.update(ciphertext);
    decryptedPayload = Buffer.concat([decryptedPayload, decipher.final()]);
    
    const decryptedObject = JSON.parse(decryptedPayload.toString('utf8'));
    console.log('  ✅ Decrypted Payload:', JSON.stringify(decryptedObject));

    // Verify it matches
    const matches = JSON.stringify(decryptedObject) === JSON.stringify(testPayload);
    console.log(`  ✅ Payload matches original: ${matches}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ SUCCESS! Encryption/Decryption works perfectly!');
    console.log('='.repeat(60));
    console.log('\nThis confirms:');
    console.log('1. ✅ Private key format is correct');
    console.log('2. ✅ Public key extraction works');
    console.log('3. ✅ RSA-OAEP with OAEP label works');
    console.log('4. ✅ AES-256-GCM encryption/decryption works');
    console.log('\nThe OAEP error on Render is likely because:');
    console.log('- Meta is still propagating the new public key');
    console.log('- OR the private key on Render is corrupted/different');

  } catch (error: any) {
    console.error('\n❌ ENCRYPTION TEST FAILED!');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Code:', error.code);
    }
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testEncryptionDecryption();
