import fetch from 'node-fetch';



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

export const stopAiService = () => {
  console.log('⚠️ AI Service shutdown placeholder');
  aiReady = false;
  aiStarting = false;
};

/**
 * ========================================
 * AI SUMMARIZATION FUNCTION
 * ========================================
 * 
 * ⚠️ ZENIX DEVELOPER: IMPLEMENT YOUR OFFLINE AI HERE ⚠️
 * 
 * This function receives note content and should return a summary.
 * Replace the placeholder logic below with your offline AI model.
 * 
 * @param {string} content - The HTML content of the note
 * @param {string} title - The title of the note
 * @returns {Promise<string>} - The summarized text
 * 
 * INSTRUCTIONS FOR YOUR DEVELOPER:
 * 1. Add your offline AI model initialization code here
 * 2. Process the content (you may want to strip HTML tags first)
 * 3. Return the summarized text
 * 4. The AI model should run locally (offline)
 * 
 * EXAMPLE IMPLEMENTATION:
 * ```javascript
 * // Strip HTML tags
 * const plainText = content.replace(/<[^>]*>/g, '');
 * 
 * // Call your offline AI model
 * const summary = await yourOfflineAI.summarize(plainText);
 * 
 * return summary;
 * ```
 */
export const summarizeNote = async (content, title = '') => {
  try {
    console.log('🤖 summarizeNote() called');
    console.log('📝 Title:', title);
    console.log('📄 Content length:', content.length);
    
    // ============================================
    // PLACEHOLDER: Replace this with your offline AI
    // ============================================
    
    // Strip HTML tags to get plain text
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    console.log('⚠️ WARNING: Using placeholder AI logic');
    console.log('📢 ZENIX DEVELOPER: Replace this with your offline AI model!');
    
    // PLACEHOLDER: Simple text truncation (NOT REAL AI)
    // Your developer should replace this with actual AI summarization
    if (plainText.length <= 200) {
      return plainText;
    }
    
    // Basic placeholder summary - YOUR DEVELOPER NEEDS TO REPLACE THIS
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join('. ') + '.';
    
    console.log('⚠️ Returning placeholder summary');
    console.log('🔄 Summary:', summary.substring(0, 100) + '...');
    
    return summary;
    
    // ============================================
    // YOUR DEVELOPER SHOULD IMPLEMENT:
    // ============================================
    // const summary = await yourOfflineAIModel.summarize(plainText, {
    //   maxLength: 200,
    //   preserveKeyPoints: true
    // });
    // return summary;
    
  } catch (error) {
    console.error('❌ AI Summarization error:', error);
    throw new Error('AI summarization failed: ' + error.message);
  }
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
