// Modified based on https://github.com/kvinwang/phatjs-playground/blob/master/lib.rs

#![cfg_attr(not(feature = "std"), no_std, no_main)]

extern crate alloc;

pub use jtee_engine::*;

#[ink::contract]
mod jtee_engine {
    use alloc::{format, string::String, vec, vec::Vec};
    use phat_js as js;
    use pink_extension::chain_extension::{signing, SigType};
    use scale::{Decode, Encode};

    pub trait ToArray<T, const N: usize> {
        fn to_array(&self) -> [T; N];
    }

    impl<T, const N: usize> ToArray<T, N> for Vec<T>
    where
        T: Default + Copy,
    {
        fn to_array(&self) -> [T; N] {
            let mut arr = [T::default(); N];
            for (a, v) in arr.iter_mut().zip(self.iter()) {
                *a = *v;
            }
            arr
        }
    }

    #[derive(Debug, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum JsEngine {
        SidevmQuickJS,
        SidevmQuickJSWithPolyfill,
        JsDelegate,
        JsDelegate2,
        CustomDriver(String),
        CustomCodeHash(Hash),
    }

    impl JsEngine {
        fn into_delegate_code_hash(self) -> Result<Hash, String> {
            match self {
                JsEngine::SidevmQuickJS => get_driver("JsRuntime"),
                JsEngine::SidevmQuickJSWithPolyfill => get_driver("JsRuntime"),
                JsEngine::JsDelegate => get_driver("JsDelegate"),
                JsEngine::JsDelegate2 => get_driver("JsDelegate2"),
                JsEngine::CustomDriver(name) => get_driver(&name),
                JsEngine::CustomCodeHash(code) => Ok(code),
            }
        }
        fn is_sidevm(&self) -> bool {
            matches!(
                self,
                JsEngine::SidevmQuickJS | JsEngine::SidevmQuickJSWithPolyfill
            )
        }
        fn with_polyfill(&self) -> bool {
            matches!(self, JsEngine::SidevmQuickJSWithPolyfill)
        }
    }

    #[ink(storage)]
    pub struct JteeEngine {
        pub key: [u8; 32],
        pub account: [u8; 20],
    }

    impl JteeEngine {
        #[ink(constructor)]
        pub fn default() -> Self {
            let key = pink_web3::keys::pink::KeyPair::derive_keypair(b"engine").private_key();
            let ecdsa_pubkey: [u8; 33] = signing::get_public_key(&key, SigType::Ecdsa)
                .try_into()
                .expect("Public key should be of length 33");
            let mut ecdsa_address = [0u8; 20];
            ink_env::ecdsa_to_eth_address(&ecdsa_pubkey, &mut ecdsa_address)
                .expect("Get address of ecdsa failed");

            Self {
                key,
                account: ecdsa_address,
            }
        }

        #[ink(message)]
        /// Executes the provided JavaScript code and returns the execution result.
        ///
        /// # Arguments
        ///
        /// * `engine` - The js engine to use.
        /// * `js_code` - The Javascript code to run
        /// * `args` - The arguments to pass to the Javascript code
        ///
        /// @ui js_code widget codemirror
        /// @ui js_code options.lang javascript
        pub fn run_js(
            &self,
            engine: JsEngine,
            js_code: String,
            args: Vec<String>,
        ) -> Result<js::JsValue, String> {
            if engine.is_sidevm() {
                if engine.with_polyfill() {
                    Ok(js::eval_async_js(&js_code, &args))
                } else {
                    Ok(pink::ext().js_eval(
                        vec![js::JsCode::Source(self.seal()), js::JsCode::Source(js_code)],
                        args,
                    ))
                }
            } else {
                js::eval_with(engine.into_delegate_code_hash()?, &js_code, &args).map(Into::into)
            }
        }

        pub fn seal(&self) -> String {
            String::from(format!(
                r#"const jtee = {{
                    "key": "0x{}",
                    "account": "0x{}",
                }};"#,
                hex::encode(self.key),
                hex::encode(self.account),
            ))
        }
    }

    pub fn get_driver(name: &str) -> Result<Hash, String> {
        use phat_js::ConvertTo;
        let system = pink::system::SystemRef::instance();
        let delegate = system.get_driver(name.into()).ok_or("No JS driver found")?;
        Ok(delegate.convert_to())
    }
}

#[cfg(test)]
mod tests {
    use super::JteeEngine;

    #[test]
    fn test_key_derivation() {
        pink_extension_runtime::mock_ext::mock_all_ext();

        let jtee = JteeEngine::default();
        println!("jtee key: {}", hex::encode(jtee.key));
        println!("seal: {:?}", jtee.seal())
    }
}
