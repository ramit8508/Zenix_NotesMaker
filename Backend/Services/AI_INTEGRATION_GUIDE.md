# AI Integration Guide for Zenix Developer

## Overview
This guide explains how to integrate your offline AI model for note summarization.

## What's Already Done ✅
1. ✅ AI route created: `POST /api/ai/summarize`
2. ✅ Frontend AI button already in place
3. ✅ AI modal to display summaries
4. ✅ All communication logic between frontend and backend

## What You Need to Do 🔧

### Step 1: Implement Your Offline AI Model

Open `Backend/Services/aiService.js` and find the `summarizeNote()` function (around line 53).

Currently, it has placeholder logic that just truncates text. You need to replace this with your offline AI model.

### Step 2: Example Implementation

```javascript
export const summarizeNote = async (content, title = '') => {
  try {
    console.log('🤖 summarizeNote() called');
    
    // Step 1: Strip HTML tags to get plain text
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    
    // Step 2: Initialize your offline AI model (if needed)
    // Example: const model = await loadYourOfflineAI();
    
    // Step 3: Call your offline AI for summarization
    // Replace this with your actual AI model call
    const summary = await yourOfflineAIModel.summarize(plainText, {
      maxLength: 200,        // Adjust as needed
      preserveKeyPoints: true,
      language: 'en'
    });
    
    // Step 4: Return the summary
    console.log('✅ Summary generated');
    return summary;
    
  } catch (error) {
    console.error('❌ AI Summarization error:', error);
    throw new Error('AI summarization failed: ' + error.message);
  }
};
```

### Step 3: Common Offline AI Models You Can Use

#### Option 1: Transformers.js (Recommended)
```javascript
import { pipeline } from '@xenova/transformers';

let summarizer = null;

export const summarizeNote = async (content, title = '') => {
  // Strip HTML
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  
  // Load model once
  if (!summarizer) {
    summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
  }
  
  // Summarize
  const result = await summarizer(plainText, {
    max_length: 150,
    min_length: 40
  });
  
  return result[0].summary_text;
};
```

#### Option 2: Local Python AI Service
```javascript
import { spawn } from 'child_process';

export const summarizeNote = (content, title = '') => {
  return new Promise((resolve, reject) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // Call your Python AI script
    const python = spawn('python', ['ai_summarize.py', plainText]);
    
    let summary = '';
    python.stdout.on('data', (data) => {
      summary += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        resolve(summary.trim());
      } else {
        reject(new Error('Python AI failed'));
      }
    });
  });
};
```

#### Option 3: Your Custom Offline Model
```javascript
import YourAIModel from './your-ai-model.js';

const model = new YourAIModel();

export const summarizeNote = async (content, title = '') => {
  const plainText = content.replace(/<[^>]*>/g, '');
  const summary = await model.generateSummary(plainText);
  return summary;
};
```

## API Details

### Request Format
The frontend sends:
```json
{
  "title": "Note title",
  "content": "<p>HTML content with text and images...</p>"
}
```

### Response Format
Your function should return **just the summary text (string)**.

The route automatically formats it as:
```json
{
  "success": true,
  "summary": "Your generated summary...",
  "originalLength": 1234,
  "summaryLength": 150
}
```

### Error Handling
If your AI fails, throw an error:
```javascript
throw new Error('AI model not loaded');
```

The route will automatically return:
```json
{
  "success": false,
  "error": "AI model not loaded"
}
```

## Testing Your Implementation

1. Start the backend server
2. Open the app and create a note with some text
3. Click the **✨ AI** button in the note header
4. You should see your AI summary in the modal

## File Locations

- **AI Service**: `Backend/Services/aiService.js`
- **AI Routes**: `Backend/Routes/aiRoutes.js`
- **Frontend Handler**: `Frontend/src/App.jsx` (handleAiSummarize function)

## Need Help?

Check the console logs:
- Backend logs: Look for 🤖, ✅, ❌ emojis
- Frontend logs: Open DevTools (F12) and check console

## Current Status

Currently, the AI uses **placeholder logic** (just truncates text). 

Your offline AI integration is the **ONLY** thing missing!

---

**Questions?** Contact the main developer or check the logs for debugging.
