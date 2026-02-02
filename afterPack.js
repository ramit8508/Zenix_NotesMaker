const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.default = async function(context) {
  const backendPath = path.join(context.appOutDir, 'resources', 'Backend');
  
  console.log('Installing Backend dependencies for AppImage...');
  console.log('Backend path:', backendPath);
  
  if (fs.existsSync(backendPath)) {
    try {
      // Install production dependencies
      execSync('npm install --production --omit=dev', {
        cwd: backendPath,
        stdio: 'inherit'
      });
      console.log('Backend dependencies installed successfully');
    } catch (error) {
      console.error('Failed to install Backend dependencies:', error);
      throw error;
    }
  } else {
    console.warn('Backend path not found:', backendPath);
  }
};
