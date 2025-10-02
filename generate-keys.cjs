const crypto = require('crypto');
const fs = require('fs');

console.log('Generating new 2048-bit RSA key pair for WhatsApp Flows...\n');

// Generate key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs1',  // Use traditional RSA format for compatibility
    format: 'pem'
  }
});

// Save keys to files
fs.writeFileSync('private_key.pem', privateKey);
fs.writeFileSync('public_key.pem', publicKey);

console.log('✓ Keys generated successfully!\n');
console.log('==================== PRIVATE KEY ====================');
console.log(privateKey);
console.log('\n==================== PUBLIC KEY ====================');
console.log(publicKey);
console.log('\n==================== INSTRUCTIONS ====================');
console.log('1. Copy the PRIVATE KEY above (including BEGIN/END lines)');
console.log('2. Store it in your WHATSAPP_FLOW_PRIVATE_KEY secret in Replit');
console.log('3. Copy the PUBLIC KEY above');
console.log('4. Upload it to WhatsApp using the curl command provided\n');

// Output format for environment variable (with escaped newlines)
const privateKeyEscaped = privateKey.replace(/\n/g, '\\n');
console.log('==================== FOR REPLIT SECRET (use this exact value) ====================');
console.log(privateKeyEscaped);
console.log('\n');
