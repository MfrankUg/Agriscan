/**
 * Generate a test private key for development
 * 
 * ⚠️ WARNING: This is for TESTING ONLY
 * ⚠️ NEVER use with real/mainnet funds
 * ⚠️ NEVER commit this key to git
 */

const crypto = require('crypto');

// Generate random 32 bytes (256 bits)
const privateKeyBytes = crypto.randomBytes(32);

// Convert to hex string with 0x prefix
const privateKey = '0x' + privateKeyBytes.toString('hex');

// Derive address (simplified - in production use proper library)
const address = '0x' + crypto.createHash('sha256')
  .update(privateKeyBytes)
  .digest('hex')
  .substring(0, 40);

console.log('\n🔑 TEST PRIVATE KEY GENERATED\n');
console.log('═══════════════════════════════════════════════════════');
console.log('Private Key:', privateKey);
console.log('Address:    ', address);
console.log('═══════════════════════════════════════════════════════\n');
console.log('⚠️  SECURITY WARNINGS:');
console.log('   • This is a TEST key - NEVER use with real funds');
console.log('   • Save this key securely');
console.log('   • Get testnet ETH from faucet for:', address);
console.log('   • Delete this key after testing\n');
console.log('📝 Next Steps:');
console.log('   1. Copy the private key above');
console.log('   2. Get Base Sepolia testnet ETH from:');
console.log('      https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
console.log('   3. Use the private key in AgriScan app\n');

