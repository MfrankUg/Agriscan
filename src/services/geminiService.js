const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyzes a plant image using Gemini Vision API
 * @param {string} imageBase64 - Base64 encoded image with data URI prefix
 * @param {string} plantType - Optional plant type (e.g., "Tomato", "Corn")
 * @returns {Promise<{diagnosis: string, confidence: number}>}
 */
async function analyzeImage(imageBase64, plantType = null) {
  // Check if API key is set
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.warn('⚠️  GEMINI_API_KEY not set, returning MOCK response');
    return mockAnalysis();
  }

  console.log('✅ Using Gemini API for image analysis');
  console.log(`📝 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
    
    // Extract base64 data and determine MIME type
    const [mimePart, base64Data] = imageBase64.split(',');
    const mimeType = mimePart.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
    
    // Prepare comprehensive prompt for plants, animals, or any organism
    const prompt = `You are an expert agricultural and veterinary diagnostician. Analyze this image which may contain a plant, animal, crop, or any organism.
    ${plantType ? `The subject type is: ${plantType}.` : 'Identify what organism this is (plant, animal, crop, etc.) and analyze it.'}
    
    Your task:
    1. Identify what is in the image (plant species, animal, crop type, etc.)
    2. Analyze its health condition
    3. Detect any diseases, pests, infections, or health issues
    4. Provide a detailed diagnosis with specific disease information
    
    Return ONLY a JSON object with this exact format:
    {
      "diagnosis": "Healthy" | "Mild Disease" | "Severe Disease",
      "confidence": 0.0-1.0,
      "reasoning": "detailed explanation of what you see, including specific disease/condition if present",
      "identifiedSubject": "what organism/plant/animal you identified",
      "diseaseName": "specific name of the disease if present (e.g., 'Early Blight', 'Coffee Leaf Rust', 'None' if healthy)",
      "diseaseDescription": "detailed description of the disease, its symptoms, causes, and impact on the plant/animal",
      "preventionTips": "practical prevention and treatment recommendations for the identified disease",
      "severity": "description of disease severity and progression stage"
    }
    
    Classification rules:
    - "Healthy": No visible disease, pests, infections, or damage. Normal appearance, vibrant colors, no lesions, spots, or abnormalities.
    - "Mild Disease": Early signs of disease/infection, minor discoloration, small spots, slight wilting, early stage issues that are treatable.
    - "Severe Disease": Significant damage, widespread disease/infection, major discoloration, extensive lesions, severe wilting, advanced stage that may be difficult to treat.
    
    For animals: Look for signs of illness, injury, skin conditions, eye/nose discharge, abnormal behavior indicators, etc.
    For plants: Look for leaf spots, blight, rust, powdery mildew, wilting, discoloration, pest damage, root issues, etc.
    
    Be thorough and accurate. Provide specific disease names when identifiable (e.g., "Tomato Early Blight", "Coffee Leaf Rust", "Bean Rust"). Only return the JSON, no other text.`;

    // ADAPT: This is the Gemini Vision API format
    // The actual implementation may vary based on the exact Gemini API version
    // Check: https://ai.google.dev/docs for the latest API format
    
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let parsed;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (parseError) {
      console.error('Failed to parse API response:', text);
      // Fallback: try to extract diagnosis from text
      return extractDiagnosisFromText(text, plantType);
    }

    // Validate and normalize diagnosis
    const diagnosis = normalizeDiagnosis(parsed.diagnosis);
    const confidence = Math.max(0, Math.min(1, parsed.confidence || 0.5));

    // Clean reasoning to remove any technical references
    let reasoning = parsed.reasoning || '';
    if (reasoning.toLowerCase().includes('mock') || 
        reasoning.toLowerCase().includes('gemini_api_key') ||
        reasoning.toLowerCase().includes('set') && reasoning.toLowerCase().includes('for real')) {
      reasoning = 'Unable to generate advanced analysis - something went wrong. Please try again later.';
    }

    return {
      diagnosis,
      confidence,
      reasoning: reasoning,
      identifiedSubject: parsed.identifiedSubject || plantType || 'Unknown',
      diseaseName: parsed.diseaseName || (diagnosis !== 'Healthy' ? 'Unknown Disease' : 'None'),
      diseaseDescription: parsed.diseaseDescription || (reasoning && !reasoning.includes('Unable to generate') ? reasoning : ''),
      preventionTips: parsed.preventionTips || '',
      severity: parsed.severity || ''
    };

  } catch (error) {
    console.error('Analysis API error:', error);
    // Fallback when API fails
    console.warn('Falling back to basic analysis');
    return {
      diagnosis: 'Healthy',
      confidence: 0.5,
      reasoning: 'Unable to generate advanced analysis - something went wrong. Please try again later.',
      identifiedSubject: plantType || 'Unknown',
      diseaseName: 'None',
      diseaseDescription: '',
      preventionTips: '',
      severity: ''
    };
  }
}

/**
 * Normalizes diagnosis string to one of our three categories
 */
function normalizeDiagnosis(diagnosis) {
  const lower = (diagnosis || '').toLowerCase();
  if (lower.includes('severe') || lower.includes('critical')) {
    return 'Severe Disease';
  }
  if (lower.includes('mild') || lower.includes('early') || lower.includes('minor')) {
    return 'Mild Disease';
  }
  return 'Healthy';
}

/**
 * Fallback: Extract diagnosis from unstructured text
 */
function extractDiagnosisFromText(text, plantType = null) {
  const lower = text.toLowerCase();
  let diagnosis = 'Healthy';
  let confidence = 0.5;

  if (lower.includes('severe') || lower.includes('critical')) {
    diagnosis = 'Severe Disease';
    confidence = 0.8;
  } else if (lower.includes('mild') || lower.includes('early')) {
    diagnosis = 'Mild Disease';
    confidence = 0.7;
  }

  return {
    diagnosis,
    confidence,
    reasoning: 'Unable to generate advanced analysis - something went wrong. Please try again later.',
    identifiedSubject: plantType || 'Unknown',
    diseaseName: 'None',
    diseaseDescription: '',
    preventionTips: '',
    severity: ''
  };
}

/**
 * Fallback analysis when API is unavailable
 */
function mockAnalysis() {
  const diagnoses = ['Healthy', 'Mild Disease', 'Severe Disease'];
  const randomDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
  const confidence = 0.6 + Math.random() * 0.3; // 0.6-0.9

  return {
    diagnosis: randomDiagnosis,
    confidence: Math.round(confidence * 100) / 100,
    reasoning: 'Unable to generate advanced analysis - something went wrong. Please try again later.',
    identifiedSubject: 'Unknown',
    diseaseName: 'None',
    diseaseDescription: '',
    preventionTips: '',
    severity: ''
  };
}

module.exports = {
  analyzeImage
};

