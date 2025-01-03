#[contract]
mod PrivateMarketplace {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    struct Listing {
        seller: ContractAddress,
        price: u256,
        token_id: u256,
        is_active: bool,
        encrypted_metadata: felt252,
    }

    #[event]
    fn ItemListed(seller: ContractAddress, token_id: u256, price: u256) {}

    #[event]
    fn ItemSold(seller: ContractAddress, buyer: ContractAddress, token_id: u256, price: u256) {}

    struct Storage {
        nft_contract: ContractAddress,
        listings: LegacyMap::<u256, Listing>,
        listing_count: u256,
    }

    #[constructor]
    fn constructor(nft_contract_address: ContractAddress) {
        nft_contract::write(nft_contract_address);
        listing_count::write(0);
    }

    #[external]
    fn create_listing(token_id: u256, price: u256, encrypted_metadata: felt252) {
        let caller = get_caller_address();
        
        // Verify ownership
        assert(IERC721::owner_of(nft_contract::read(), token_id) == caller, 'Not token owner');

        // Create listing
        let listing_id = listing_count::read();
        listings::write(listing_id, Listing {
            seller: caller,
            price,
            token_id,
            is_active: true,
            encrypted_metadata,
        });
        listing_count::write(listing_id + 1);

        // Emit event
        ItemListed(caller, token_id, price);
    }

    #[external]
    fn buy_listing(listing_id: u256) {
        let caller = get_caller_address();
        let listing = listings::read(listing_id);
        
        assert(listing.is_active, 'Listing not active');
        assert(caller != listing.seller, 'Seller cannot buy');

        // Transfer NFT
        IERC721::transfer_from(
            nft_contract::read(),
            listing.seller,
            caller,
            listing.token_id
        );

        // Update listing status
        listings::write(listing_id, Listing {
            seller: listing.seller,
            price: listing.price,
            token_id: listing.token_id,
            is_active: false,
            encrypted_metadata: listing.encrypted_metadata,
        });

        // Emit event
        ItemSold(listing.seller, caller, listing.token_id, listing.price);
    }

    #[view]
    fn get_listing(listing_id: u256) -> Listing {
        listings::read(listing_id)
    }

    #[view]
    fn get_listing_count() -> u256 {
        listing_count::read()
    }
}
