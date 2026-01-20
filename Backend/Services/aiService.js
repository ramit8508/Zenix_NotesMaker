import fetch from 'node-fetch';

// ============================================
// AI SERVICE STUB - READY FOR CUSTOM AI
// ============================================
// Your friend can implement the AI service here!
// This stub keeps the routing intact while AI implementation is pending.
// 
// TO INTEGRATE CUSTOM AI:
// 1. Implement your AI service (built-in AI from OS)
// 2. Replace the placeholders below with actual calls to your AI
// 3. Update the AI_SERVICE_URL if needed
// ============================================

const AI_SERVICE_URL = 'http://localhost:5001'; // Change this to your AI service URL

let aiReady = false;
let aiStarting = false;

export const isAiReady = () => aiReady;
export const isAiStarting = () => aiStarting;

/**
 * Check if custom AI service is running
 * TODO: Implement health check for your custom AI
 */
export const checkAiHealth = async () => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`, { timeout: 2000 });
    const data = await response.json();
    aiReady = data.status === 'ok' && data.models_loaded;
    return aiReady;
  } catch (error) {
    aiReady = false;
    return false;
  }
};

/**
 * Start the custom AI service
 * TODO: Implement startup logic for your custom AI
 */
export const startAiService = () => {
  return new Promise((resolve, reject) => {
    if (aiReady) {
      resolve({ status: 'already_running' });
      return;
    }

    // PLACEHOLDER: Add your custom AI startup logic here
    console.log('⚠️ AI Service startup not implemented yet');
    console.log('💡 Waiting for custom AI integration...');
    
    reject(new Error('Custom AI not implemented yet. Your friend needs to add the built-in AI.'));
  });
};

/**
 * Stop the custom AI service
 * TODO: Implement shutdown logic for your custom AI
 */
export const stopAiService = () => {
  console.log('⚠️ AI Service shutdown placeholder');
  aiReady = false;
  aiStarting = false;
};

// Cleanup on exit
process.on('exit', stopAiService);
process.on('SIGINT', () => {
  stopAiService();
  process.exit();
});
process.on('SIGTERM', () => {
  stopAiService();
  process.exit();
});
