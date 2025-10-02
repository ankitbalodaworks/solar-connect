import crypto from 'crypto';

console.log('🔑 Generating a FRESH RSA-2048 Key Pair for WhatsApp Flows...\n');
console.log('='.repeat(70));

// Generate a fresh 2048-bit RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('\n✅ FRESH PRIVATE KEY (store this in Replit Secrets AND Render):');
console.log('='.repeat(70));
console.log(privateKey);

console.log('\n✅ FRESH PUBLIC KEY (upload to Meta):');
console.log('='.repeat(70));
console.log(publicKey);

console.log('\n📋 NEXT STEPS:');
console.log('='.repeat(70));
console.log('1. Copy the PRIVATE KEY above');
console.log('2. Store it in Replit Secrets as WHATSAPP_FLOW_PRIVATE_KEY');
console.log('3. Store it in Render environment variables as WHATSAPP_FLOW_PRIVATE_KEY');
console.log('4. Copy the PUBLIC KEY above');
console.log('5. Run: tsx scripts/upload-public-key.ts');
console.log('6. Wait 10-15 minutes for Meta propagation');
console.log('7. Test the Flow health check again');
console.log('');
console.log('⚠️  IMPORTANT: Make sure there are NO quotes around the keys!');
console.log('⚠️  Copy them exactly as shown, including the header/footer lines.');
