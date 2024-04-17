#![cfg_attr(not(any(feature = "std", test)), no_std, no_main)]

#[macro_use]
extern crate alloc;

pub use crate::jtee_engine::*;

#[ink::contract(env = PinkEnvironment)]
mod jtee_engine {
    use alloc::vec::Vec;
    use pink::chain_extension::{signing as sig, JsCode, JsValue};
    use pink::system::{ContractDeposit, DriverError, Result, SystemRef};
    use pink::types::sgx::AttestationType;
    use pink::{PinkEnvironment, WorkerId};

    use alloc::string::{String, ToString};
    use phat_js as js;

    // use sgx_attestation::dcap::{Quote, SgxV30QuoteCollateral as Collateral};
    // use sgx_attestation::SgxQuote;

    // type RawQuote = Vec<u8>;

    #[ink(storage)]
    pub struct JteeEngine;

    impl JteeEngine {
        #[ink(constructor)]
        #[allow(clippy::should_implement_trait)]
        pub fn default() -> Self {
            Self {}
        }

        #[ink(message)]
        pub fn run_js(&self, script: String, args: Vec<String>) -> JsValue {
            pink::ext().js_eval(alloc::vec![JsCode::Source(script)], args)
        }
    }
}
