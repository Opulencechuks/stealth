#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, BytesN, Env,
};

#[contract]
pub struct PostageContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Postage {
    pub sender: Address,
    pub recipient: Address,
    pub amount: i128,
    pub payment_hash: BytesN<32>,
    pub created_at: u64,
    pub status: PostageStatus,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum PostageStatus {
    Pending,
    Settled,
    Refunded,
}

#[contracttype]
enum DataKey {
    Minimum,
    Postage(BytesN<32>),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
    DuplicateMessage = 4,
    PostageNotFound = 5,
    AlreadyResolved = 6,
}

#[contractimpl]
impl PostageContract {
    pub fn initialize(env: Env, minimum: i128) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Minimum) {
            return Err(Error::AlreadyInitialized);
        }
        if minimum < 0 {
            return Err(Error::InvalidAmount);
        }

        env.storage().instance().set(&DataKey::Minimum, &minimum);
        Ok(())
    }

    pub fn minimum(env: Env) -> Result<i128, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Minimum)
            .ok_or(Error::NotInitialized)
    }

    pub fn quote(env: Env, sender_trusted: bool) -> Result<i128, Error> {
        if sender_trusted {
            return Ok(0);
        }
        Self::minimum(env)
    }

    pub fn submit(
        env: Env,
        message_id: BytesN<32>,
        sender: Address,
        recipient: Address,
        amount: i128,
        payment_hash: BytesN<32>,
    ) -> Result<Postage, Error> {
        sender.require_auth();

        let minimum = Self::minimum(env.clone())?;
        if amount < minimum {
            return Err(Error::InvalidAmount);
        }

        let key = DataKey::Postage(message_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::DuplicateMessage);
        }

        let postage = Postage {
            sender,
            recipient,
            amount,
            payment_hash,
            created_at: env.ledger().timestamp(),
            status: PostageStatus::Pending,
        };
        env.storage().persistent().set(&key, &postage);
        env.events()
            .publish((symbol_short!("postage"), message_id), postage.clone());
        Ok(postage)
    }

    pub fn settle(env: Env, message_id: BytesN<32>) -> Result<Postage, Error> {
        Self::resolve(env, message_id, PostageStatus::Settled)
    }

    pub fn refund(env: Env, message_id: BytesN<32>) -> Result<Postage, Error> {
        Self::resolve(env, message_id, PostageStatus::Refunded)
    }

    pub fn get(env: Env, message_id: BytesN<32>) -> Result<Postage, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Postage(message_id))
            .ok_or(Error::PostageNotFound)
    }

    fn resolve(env: Env, message_id: BytesN<32>, status: PostageStatus) -> Result<Postage, Error> {
        let key = DataKey::Postage(message_id.clone());
        let mut postage: Postage = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::PostageNotFound)?;

        postage.recipient.require_auth();
        if postage.status != PostageStatus::Pending {
            return Err(Error::AlreadyResolved);
        }

        postage.status = status;
        env.storage().persistent().set(&key, &postage);
        env.events()
            .publish((symbol_short!("resolved"), message_id), postage.clone());
        Ok(postage)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Ledger};

    fn id(env: &Env, byte: u8) -> BytesN<32> {
        BytesN::from_array(env, &[byte; 32])
    }

    #[test]
    fn records_and_settles_postage() {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(42);
        let contract_id = env.register(PostageContract, ());
        let client = PostageContractClient::new(&env, &contract_id);
        let sender = Address::generate(&env);
        let recipient = Address::generate(&env);

        client.initialize(&100);
        let postage = client.submit(&id(&env, 1), &sender, &recipient, &125, &id(&env, 2));
        assert_eq!(postage.status, PostageStatus::Pending);
        assert_eq!(postage.created_at, 42);

        let settled = client.settle(&id(&env, 1));
        assert_eq!(settled.status, PostageStatus::Settled);
    }

    #[test]
    fn trusted_sender_has_zero_quote() {
        let env = Env::default();
        let contract_id = env.register(PostageContract, ());
        let client = PostageContractClient::new(&env, &contract_id);
        client.initialize(&100);

        assert_eq!(client.quote(&true), 0);
        assert_eq!(client.quote(&false), 100);
    }
}
