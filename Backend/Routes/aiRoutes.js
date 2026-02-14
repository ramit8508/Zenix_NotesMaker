import express from 'express';
import { summarizeNote } from '../Services/aiService.js';

const router = express.Router();

/**
 * AI Summarization Route
 * POST /api/ai/summarize
 * 
 * This endpoint receives note content and returns a summary.
 * Your Zenix developer needs to implement the offline AI logic in:
 * Backend/Services/aiService.js -> summarizeNote() function
 */
router.post('/summarize', async (req, res) => {
  try {
    const { content, title } = req.body;
    
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        error: 'No content provided' 
      });
    }
    
    console.log('🤖 AI Summarization requested');
    console.log('📝 Title:', title);
    console.log('📄 Content length:', content.length, 'characters');
    
    // Call the AI service to summarize
    const summary = await summarizeNote(content, title);
    
    console.log('✅ Summary generated successfully');
    console.log('📊 Summary length:', summary.length, 'characters');
    
    res.json({ 
      success: true, 
      summary,
      originalLength: content.length,
      summaryLength: summary.length
    });
    
  } catch (error) {
    console.error('❌ AI Summarization failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
