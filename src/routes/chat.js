const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * POST /chat
 * Accepts: { message: string, context?: string }
 * Returns: { response: string }
 */
router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Missing required field: message' 
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey.trim() === '') {
      console.warn('⚠️  API key not set for chat, returning fallback response');
      // Fallback response when API is unavailable
      return res.json({
        response: 'Unable to generate advanced analysis - something went wrong. Please try again later or contact support if the issue persists.'
      });
    }

    console.log('✅ Using Gemini API for chat');
    console.log(`📝 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Build context-aware prompt
    const systemPrompt = `You are AgriScan AI, an expert agricultural advisor specializing in East African crops and farming practices. 
Your role is to help farmers with:
- Crop disease identification and treatment
- Prevention strategies
- Best farming practices
- Irrigation and fertilization advice
- Pest management
- Crop-specific guidance

Keep your answers:
- Simple and easy to understand
- Practical and actionable
- Tailored to East African farming conditions
- Focused on sustainable and affordable solutions
- In a friendly, supportive tone

${context ? `Context: The farmer is currently dealing with: ${context}` : ''}

User question: ${message}

Provide a helpful, detailed response:`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response.text();

    res.json({
      response: response,
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message 
    });
  }
});

module.exports = router;

