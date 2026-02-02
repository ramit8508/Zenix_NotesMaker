#!/usr/bin/env node
// Wrapper to ensure Backend runs properly in AppImage environment

console.log('🚀 Starting NotesMaker Backend...');
console.log('Environment:', process.env.IS_PACKAGED === 'true' ? 'PACKAGED' : 'DEVELOPMENT');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

try {
  await import('./Index.js');
} catch (err) {
  console.error('❌ Failed to start backend:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
}
