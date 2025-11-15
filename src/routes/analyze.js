const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const ipfsService = require('../services/ipfsService');

/**
 * POST /analyze
 * Accepts: { imageBase64: string, plantType?: string }
 * Returns: { diagnosis: string, confidence: number, imageCid: string }
 */
router.post('/', async (req, res) => {
  try {
    const { imageBase64, plantType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ 
        error: 'Missing required field: imageBase64' 
      });
    }

    // Validate base64 format
    if (!imageBase64.startsWith('data:image/')) {
      return res.status(400).json({ 
        error: 'Invalid image format. Expected data URI with base64' 
      });
    }

    // Call Gemini Vision API
    const geminiResult = await geminiService.analyzeImage(imageBase64, plantType);
    
    // Optionally upload to IPFS
    let imageCid = null;
    if (process.env.IPFS_API_KEY) {
      try {
        // Extract base64 data (remove data:image/...;base64, prefix)
        const base64Data = imageBase64.split(',')[1];
        const imageBuffer = Buffer.from(base64Data, 'base64');
        imageCid = await ipfsService.uploadImage(imageBuffer);
      } catch (ipfsError) {
        console.warn('IPFS upload failed, continuing without CID:', ipfsError.message);
        // Continue without IPFS if upload fails
      }
    }

    res.json({
      diagnosis: geminiResult.diagnosis,
      confidence: geminiResult.confidence,
      imageCid: imageCid,
      identifiedSubject: geminiResult.identifiedSubject || plantType || 'Unknown',
      reasoning: geminiResult.reasoning || '',
      diseaseName: geminiResult.diseaseName || '',
      diseaseDescription: geminiResult.diseaseDescription || '',
      preventionTips: geminiResult.preventionTips || '',
      severity: geminiResult.severity || ''
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze image',
      message: error.message 
    });
  }
});

module.exports = router;

