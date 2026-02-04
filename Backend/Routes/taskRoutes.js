import express from 'express';
import {
  getNotes,
  getNotesByFolder,
  getNoteStats,
  getFolders,
  createNote,
  updateNote,
  deleteNote  createFolder,
  renameFolder,
  deleteFolder,} from '../Controllers/taskController.js';
import fetch from 'node-fetch';
import { startAiService, checkAiHealth, isAiReady, isAiStarting } from '../Services/aiService.js';

const router = express.Router();

router.get('/notes', getNotes);
router.get('/notes/folder/:folder', getNotesByFolder);
router.get('/notes/stats', getNoteStats);
router.get('/folders', getFolders);
router.post('/notes', createNote);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

// ============================================
// AI ROUTES - READY FOR CUSTOM AI INTEGRATION
// ============================================
// These routes are placeholders for your friend's custom AI
// The frontend will call these endpoints
// Just implement the actual AI logic when ready!
// ============================================

router.post('/ai/analyze-note', async (req, res) => {
  try {
    // PLACEHOLDER: Replace this with actual AI call
    // Your friend can integrate the built-in OS AI here
    
    const { title, content } = req.body;
    
    // For now, return a placeholder response
    // TODO: Call your custom AI service here
    res.json({
      success: false,
      error: 'AI Service not implemented yet. Waiting for custom AI integration.',
      placeholder: true,
      // Example response format your AI should return:
      // success: true,
      // summary: "AI-generated summary",
      // key_points: "• Point 1\n• Point 2\n• Point 3",
      // image_count: 0,
      // word_count: 100
    });
    
  } catch (error) {
    console.error('AI analyze error:', error);
    res.json({ 
      success: false, 
      error: error.message,
      placeholder: true
    });
  }
});

router.get('/ai/health', async (req, res) => {
  // PLACEHOLDER: Check your custom AI health here
  const ready = await checkAiHealth();
  res.json({ 
    status: ready ? 'ok' : 'offline',
    models_loaded: ready,
    placeholder: true,
    message: 'Waiting for custom AI integration'
  });
});

router.post('/ai/start', async (req, res) => {
  // PLACEHOLDER: Start your custom AI here
  res.json({ 
    success: false, 
    error: 'Custom AI not implemented yet',
    placeholder: true,
    message: 'Your friend needs to add the built-in AI service'
  });
});

export default router;
