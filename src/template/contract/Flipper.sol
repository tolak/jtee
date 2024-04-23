pragma solidity >=0.4.22 <0.9.0;

contract Flipper {
    // Only prover have the permission to flip the state
    address public prover;

    // The flipper state
    bool private flipped;

    // Setting the `prover` as the account derived in TEE when initializing the contract
    constructor(address _prover) {
        prover = _prover;
        flipped = false;
    }

    // The function to flip the state
    function flip() public {
        require(msg.sender == prover, "Only the prover can flip the state.");

        // Flip the state
        flipped = !flipped;
    }

    function getState() public view returns (bool) {
        return flipped;
    }
}
