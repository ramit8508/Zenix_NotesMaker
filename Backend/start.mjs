#!/usr/bin/env node
// Wrapper to ensure Backend runs properly in AppImage environment

import('./Index.js').catch(err => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});
