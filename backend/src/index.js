const express = require('express');
const cors = require('cors');
const { Provider } = require('starknet');
const winston = require('winston');
const EncryptionService = require('./utils/encryption');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialize encryption service
const encryptionService = new EncryptionService(process.env.ENCRYPTION_KEY || 'your-secret-key');

// Initialize Starknet provider
const provider = new Provider({
  sequencer: {
    baseUrl: 'https://alpha4.starknet.io',
    feederGatewayUrl: 'https://alpha4.starknet.io/feeder_gateway',
    gatewayUrl: 'https://alpha4.starknet.io/gateway'
  }
});

// Store listings in memory (replace with database in production)
const listings = new Map();
const metadata = new Map();

// Middleware to handle private data encryption
const encryptMetadata = async (req, res, next) => {
  try {
    if (req.body.metadata) {
      req.body.encryptedMetadata = encryptionService.encrypt(req.body.metadata);
    }
    next();
  } catch (error) {
    logger.error('Encryption error:', error);
    res.status(500).json({ error: 'Failed to encrypt metadata' });
  }
};

// API Routes
app.post('/api/nft/metadata', encryptMetadata, async (req, res) => {
  try {
    const { encryptedMetadata } = req.body;
    const metadataId = Date.now().toString();
    metadata.set(metadataId, {
      data: encryptedMetadata,
      owner: req.body.owner
    });
    res.json({ metadataId });
  } catch (error) {
    logger.error('Store metadata error:', error);
    res.status(500).json({ error: 'Failed to store metadata' });
  }
});

app.get('/api/nft/metadata/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const metadataEntry = metadata.get(id);
    
    if (!metadataEntry) {
      return res.status(404).json({ error: 'Metadata not found' });
    }

    // Verify user has access (implement proper access control in production)
    const decryptedData = encryptionService.decrypt(metadataEntry.data);
    res.json({ metadata: decryptedData });
  } catch (error) {
    logger.error('Retrieve metadata error:', error);
    res.status(500).json({ error: 'Failed to retrieve metadata' });
  }
});

// Marketplace routes
app.post('/api/listings', encryptMetadata, async (req, res) => {
  try {
    const { tokenId, price, metadata } = req.body;
    const listingId = Date.now().toString();
    
    const listingData = {
      id: listingId,
      tokenId,
      price: encryptionService.encrypt(price.toString()),
      metadata: req.body.encryptedMetadata,
      seller: req.body.seller,
      createdAt: new Date().toISOString()
    };
    
    listings.set(listingId, listingData);
    
    res.json({ 
      listingId,
      publicData: {
        tokenId,
        listingId
      }
    });
  } catch (error) {
    logger.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const listing = listings.get(id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Decrypt the data
    const decryptedListing = {
      ...listing,
      price: parseFloat(encryptionService.decrypt(listing.price)),
      metadata: encryptionService.decrypt(listing.metadata)
    };
    
    res.json(decryptedListing);
  } catch (error) {
    logger.error('Retrieve listing error:', error);
    res.status(500).json({ error: 'Failed to retrieve listing' });
  }
});

app.get('/api/listings', async (req, res) => {
  try {
    const allListings = Array.from(listings.values()).map(listing => ({
      ...listing,
      price: parseFloat(encryptionService.decrypt(listing.price)),
      metadata: encryptionService.decrypt(listing.metadata)
    }));
    
    res.json(allListings);
  } catch (error) {
    logger.error('Retrieve listings error:', error);
    res.status(500).json({ error: 'Failed to retrieve listings' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});
