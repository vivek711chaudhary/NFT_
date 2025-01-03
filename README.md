# Private NFT Marketplace

A secure and private NFT marketplace built on Starknet with Calimero integration for enhanced privacy features.

## Features

- Private NFT listings and transactions
- Secure wallet integration
- Encrypted metadata storage
- Private bidding system
- Access control mechanisms

## Technology Stack

- Starknet (Layer 2 scaling)
- Calimero (Privacy layer)
- Cairo (Smart contracts)
- React (Frontend)
- Node.js (Backend)

## Project Structure

```
├── contracts/           # Smart contracts written in Cairo
├── frontend/           # React frontend application
├── backend/            # Node.js backend server
├── scripts/            # Deployment and utility scripts
└── tests/             # Test files
```

## Setup Instructions

1. Install dependencies:
```bash
# Install Cairo
curl -L https://raw.githubusercontent.com/software-mansion/protostar/master/install.sh | bash

# Install Node.js dependencies
npm install
```

2. Configure environment:
- Create `.env` file with necessary configuration
- Set up Starknet and Calimero credentials

3. Run the application:
```bash
# Start frontend
cd frontend
npm start

# Start backend
cd backend
npm start
```

## Development

### Smart Contracts
The smart contracts are written in Cairo and handle:
- NFT minting and management
- Marketplace operations
- Access control
- Privacy features integration

### Frontend
The frontend provides:
- User interface for NFT management
- Wallet integration
- Private transaction handling
- Marketplace browsing and interaction

### Backend
The backend manages:
- API endpoints
- Integration with Starknet
- Calimero privacy features
- Data encryption and management

## Testing

```bash
# Run smart contract tests
protostar test

# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
