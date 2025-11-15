// Vercel serverless function entry point
// This file is used when deploying to Vercel
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeRoute = require('../src/routes/analyze');
const chatRoute = require('../src/routes/chat');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/analyze', analyzeRoute);
app.use('/chat', chatRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Export for Vercel serverless
module.exports = app;

