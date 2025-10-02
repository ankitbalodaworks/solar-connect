import crypto from 'crypto';

console.log('🔍 Diagnosing Key Mismatch Issue\n');
console.log('='.repeat(70));

const privateKey = process.env.WHATSAPP_FLOW_PRIVATE_KEY;

if (!privateKey) {
  console.log('❌ ERROR: WHATSAPP_FLOW_PRIVATE_KEY not found in environment');
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

console.log('\n📋 Your Current Private Key (in Replit):');
console.log('='.repeat(70));
console.log(formattedPrivateKey);
console.log('='.repeat(70));

// Extract public key
const rsaPrivateKey = crypto.createPrivateKey({
  key: formattedPrivateKey,
  format: 'pem'
});
const rsaPublicKey = crypto.createPublicKey(rsaPrivateKey);
const publicKeyPem = rsaPublicKey.export({ type: 'spki', format: 'pem' });

console.log('\n📋 Corresponding Public Key:');
console.log('='.repeat(70));
console.log(publicKeyPem);
console.log('='.repeat(70));

// Test encryption/decryption
console.log('\n🧪 Testing Key Pair...');
const testAesKey = crypto.randomBytes(32); // 32 bytes for AES-256
console.log(`  Generated test AES key: ${testAesKey.length} bytes`);

// Encrypt with public key
const encrypted = crypto.publicEncrypt(
  {
    key: rsaPublicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  testAesKey
);
console.log(`  ✅ Encrypted with public key: ${encrypted.length} bytes`);

// Decrypt with private key
const decrypted = crypto.privateDecrypt(
  {
    key: rsaPrivateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: 'sha256'
  },
  encrypted
);
console.log(`  ✅ Decrypted with private key: ${decrypted.length} bytes`);

const matches = decrypted.equals(testAesKey);
console.log(`  ${matches ? '✅' : '❌'} Keys match: ${matches}`);

if (!matches) {
  console.log('\n❌ CRITICAL: Key pair is corrupted!');
  process.exit(1);
}

console.log('\n' + '='.repeat(70));
console.log('📝 NEXT STEPS:');
console.log('='.repeat(70));
console.log('\n1. Copy the PRIVATE KEY above (entire block)');
console.log('2. Go to Render Dashboard → Your Service → Environment');
console.log('3. Find WHATSAPP_FLOW_PRIVATE_KEY and click Edit');
console.log('4. Paste the private key (no quotes, exact copy)');
console.log('5. Save and wait for Render to redeploy (2-3 minutes)');
console.log('6. Run: tsx scripts/verify-public-key.ts');
console.log('7. Verify the public key matches what\'s shown above');
console.log('8. Test the WhatsApp Flow health check');
console.log('\n⚠️  IMPORTANT: The private key on Render must EXACTLY match');
console.log('   the one shown above for decryption to work!');
console.log('');
