const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.default = async function(context) {
  const backendPath = path.join(context.appOutDir, 'resources', 'Backend');
  
  console.log('\n' + '='.repeat(60));
  console.log('Setting up Backend for Electron');
  console.log('='.repeat(60));
  console.log('Backend:', backendPath);
  console.log('Electron:', context.electronVersion);
  console.log('Platform:', context.platform.name);
  
  if (!fs.existsSync(backendPath)) {
    console.warn('⚠️  Backend path not found:', backendPath);
    return;
  }

  try {
    // Install production dependencies
    console.log('\n[1/2] Installing dependencies...');
    execSync('npm install --production --omit=dev --no-audit --no-fund', {
      cwd: backendPath,
      stdio: 'inherit'
    });
    
    // Rebuild better-sqlite3 for Electron
    console.log('\n[2/2] Rebuilding better-sqlite3 for Electron...');
    execSync(`npx --yes @electron/rebuild -v ${context.electronVersion} -m ${backendPath} -o better-sqlite3`, {
      cwd: backendPath,
      stdio: 'inherit'
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Backend ready!');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    throw error;
  }
};
