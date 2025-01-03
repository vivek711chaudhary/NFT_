import React, { useState, useEffect } from 'react';
import { connect } from 'get-starknet';
import { Contract } from 'starknet';
import { apiService } from './services/api';

function App() {
  const [account, setAccount] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newListing, setNewListing] = useState({
    tokenId: '',
    price: '',
    metadata: {
      name: '',
      description: '',
      image: '',
    },
  });

  const connectWallet = async () => {
    try {
      const starknet = await connect();
      if (!starknet) throw new Error('Failed to connect to StarkNet');
      
      await starknet.enable();
      setAccount(starknet.selectedAddress);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const fetchedListings = await apiService.getListings();
      setListings(fetchedListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
    setLoading(false);
  };

  const createListing = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiService.createListing(
        newListing.tokenId,
        newListing.price,
        newListing.metadata,
        account
      );
      await fetchListings();
      setNewListing({
        tokenId: '',
        price: '',
        metadata: { name: '', description: '', image: '' },
      });
    } catch (error) {
      console.error('Error creating listing:', error);
    }
    setCreating(false);
  };

  const buyNFT = async (listingHash) => {
    try {
      const listing = await apiService.getListing(listingHash);
      // Implement buying logic with Starknet contract
      console.log('Buying NFT:', listing);
    } catch (error) {
      console.error('Error buying NFT:', error);
    }
  };

  useEffect(() => {
    if (account) {
      fetchListings();
    }
  }, [account]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">Private NFT Marketplace</h1>
            </div>
            <div className="flex items-center">
              {!account ? (
                <button
                  onClick={connectWallet}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  Connect Wallet
                </button>
              ) : (
                <span className="text-gray-700">
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {account && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Create New Listing</h2>
            <form onSubmit={createListing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Token ID
                </label>
                <input
                  type="text"
                  value={newListing.tokenId}
                  onChange={(e) =>
                    setNewListing({ ...newListing, tokenId: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={newListing.price}
                  onChange={(e) =>
                    setNewListing({ ...newListing, price: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  NFT Name
                </label>
                <input
                  type="text"
                  value={newListing.metadata.name}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      metadata: { ...newListing.metadata, name: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newListing.metadata.description}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      metadata: {
                        ...newListing.metadata,
                        description: e.target.value,
                      },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="text"
                  value={newListing.metadata.image}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      metadata: { ...newListing.metadata, image: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Listing'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <div
                key={listing.hash}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-4">
                  <img
                    src={listing.metadata.image}
                    alt={listing.metadata.name}
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <h3 className="mt-4 text-lg font-medium">
                    {listing.metadata.name}
                  </h3>
                  <p className="mt-1 text-gray-500">
                    {listing.metadata.description}
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    Price: {listing.price} ETH
                  </p>
                  <button
                    onClick={() => buyNFT(listing.hash)}
                    className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    Buy NFT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
