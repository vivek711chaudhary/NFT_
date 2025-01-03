#[contract]
mod PrivateNFT {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    #[event]
    fn Transfer(from: ContractAddress, to: ContractAddress, token_id: u256) {}

    #[event]
    fn Approval(owner: ContractAddress, approved: ContractAddress, token_id: u256) {}

    struct Storage {
        name: felt252,
        symbol: felt252,
        owners: LegacyMap::<u256, ContractAddress>,
        balances: LegacyMap::<ContractAddress, u256>,
        token_approvals: LegacyMap::<u256, ContractAddress>,
    }

    #[constructor]
    fn constructor(name: felt252, symbol: felt252) {
        name::write(name);
        symbol::write(symbol);
    }

    #[external]
    fn name() -> felt252 {
        name::read()
    }

    #[external]
    fn symbol() -> felt252 {
        symbol::read()
    }

    #[external]
    fn balance_of(owner: ContractAddress) -> u256 {
        balances::read(owner)
    }

    #[external]
    fn owner_of(token_id: u256) -> ContractAddress {
        let owner = owners::read(token_id);
        assert(!owner.is_zero(), 'ERC721: invalid token ID');
        owner
    }

    #[external]
    fn mint(to: ContractAddress, token_id: u256) {
        let caller = get_caller_address();
        assert(!to.is_zero(), 'ERC721: mint to zero address');
        assert(owners::read(token_id).is_zero(), 'ERC721: token already minted');

        // Update state
        balances::write(to, balances::read(to) + 1);
        owners::write(token_id, to);

        // Emit transfer event
        Transfer(ContractAddress { value: 0 }, to, token_id);
    }

    #[external]
    fn transfer(to: ContractAddress, token_id: u256) {
        let caller = get_caller_address();
        assert(!to.is_zero(), 'ERC721: transfer to zero address');
        
        let owner = owners::read(token_id);
        assert(caller == owner, 'ERC721: transfer from incorrect owner');

        // Update state
        owners::write(token_id, to);
        balances::write(owner, balances::read(owner) - 1);
        balances::write(to, balances::read(to) + 1);

        // Emit transfer event
        Transfer(owner, to, token_id);
    }
}
