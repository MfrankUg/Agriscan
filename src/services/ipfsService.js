const { NFTStorage } = require('nft.storage');

let nftStorageClient = null;

// Initialize NFT.Storage client if API key is available
if (process.env.IPFS_API_KEY) {
  nftStorageClient = new NFTStorage({ token: process.env.IPFS_API_KEY });
}

/**
 * Uploads an image buffer to IPFS via NFT.Storage
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<string>} IPFS CID
 */
async function uploadImage(imageBuffer) {
  if (!nftStorageClient) {
    throw new Error('IPFS_API_KEY not configured');
  }

  try {
    // Create a File-like object for NFT.Storage
    const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
    const file = new File([blob], 'plant-image.jpg', { type: 'image/jpeg' });

    // Upload to IPFS
    const cid = await nftStorageClient.storeBlob(file);
    
    console.log(`✅ Image uploaded to IPFS: ${cid}`);
    return cid;

  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`IPFS upload failed: ${error.message}`);
  }
}

/**
 * Alternative: Pinata IPFS upload (if using Pinata instead of NFT.Storage)
 * Uncomment and configure if using Pinata
 */
/*
async function uploadImagePinata(imageBuffer) {
  const FormData = require('form-data');
  const axios = require('axios');
  const fs = require('fs');

  const formData = new FormData();
  formData.append('file', imageBuffer, {
    filename: 'plant-image.jpg',
    contentType: 'image/jpeg'
  });

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_KEY,
          ...formData.getHeaders()
        }
      }
    );

    return response.data.IpfsHash; // Pinata returns IpfsHash, which is the CID
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}
*/

module.exports = {
  uploadImage
};

