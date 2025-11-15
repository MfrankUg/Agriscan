# AgriScan Backend

AI-powered crop disease diagnosis backend using Google Gemini Vision API and IPFS storage.

## Features

- 🌱 **AI Image Analysis** - Diagnose crop diseases using Gemini Vision API
- 💬 **AI Chatbot** - Agricultural advisor powered by Gemini Pro
- 📦 **IPFS Storage** - Decentralized image storage via NFT.Storage
- 🔗 **Blockchain Ready** - Returns IPFS CIDs for on-chain storage

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Analyze Image
```
POST /analyze
Body: {
  "imageBase64": "data:image/jpeg;base64,...",
  "plantType": "Tomato" (optional)
}
```
Returns diagnosis, confidence, and IPFS CID.

### Chat
```
POST /chat
Body: {
  "message": "How do I treat early blight?",
  "context": "Tomato plant with brown spots" (optional)
}
```
Returns AI agricultural advice.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` and add:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `IPFS_API_KEY` - Your NFT.Storage API key (optional)

3. **Run locally**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Test**
   ```bash
   curl http://localhost:3000/health
   ```

## Deployment

### Vercel

This backend is configured for Vercel deployment:

1. Push to GitHub
2. Import to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

See `../DEPLOY_TO_VERCEL.md` for detailed instructions.

## Environment Variables

- `GEMINI_API_KEY` - Required for AI analysis
- `IPFS_API_KEY` - Optional, for IPFS storage
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (production/development)

## Tech Stack

- **Express.js** - Web framework
- **Google Gemini AI** - Vision and chat models
- **NFT.Storage** - IPFS storage
- **CORS** - Cross-origin support

## License

MIT

