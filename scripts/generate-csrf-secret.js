#!/usr/bin/env node

/**
 * Generate CSRF Secret
 * Generates a secure random secret for CSRF token generation
 */

const crypto = require('crypto')

const secret = crypto.randomBytes(32).toString('hex')

console.log('\n=== CSRF Secret Generated ===\n')
console.log('Add this to your .env file:\n')
console.log(`CSRF_SECRET=${secret}\n`)
console.log('Keep this secret secure and never commit it to version control!\n')
