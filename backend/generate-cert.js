const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating self-signed SSL certificate...\n');

const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'countryName', value: 'US' },
  { name: 'organizationName', value: 'Secure Auth Demo' }
];

const options = {
  days: 365,
  keySize: 2048,
  algorithm: 'sha256'
};

const pems = selfsigned.generate(attrs, options);

// Create ssl directory if it doesn't exist
const sslDir = path.join(__dirname, 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir);
}

// Write certificate and private key
fs.writeFileSync(path.join(sslDir, 'cert.pem'), pems.cert);
fs.writeFileSync(path.join(sslDir, 'key.pem'), pems.private);

console.log('✅ SSL certificate generated successfully!');
console.log('📁 Location: backend/ssl/');
console.log('📄 Files created:');
console.log('   - cert.pem (Certificate)');
console.log('   - key.pem (Private Key)');
console.log('\n⚠️  Note: This is a self-signed certificate for development only.');
console.log('    Your browser will show a security warning - this is expected.\n');
