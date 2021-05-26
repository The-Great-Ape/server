import Web3 from 'web3';

const rpcURL = 'https://mainnet.infura.io/v3/4a07335a531e448d95016a2b8e9e0d71'
const web3 = new Web3(rpcURL)

// The minimum ABI to get ERC20 Token balance
const minABI = [
    // balanceOf
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    },
    // decimals
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "name": "", "type": "uint8" }],
        "type": "function"
    }
];

class Token {

    constructor(addr) {
        this.tokenAddress = addr;
        this.contract = new web3.eth.Contract(minABI, this.tokenAddress);
    }

    async getBalance(walletAddress) {
        let balance = await this.contract.methods.balanceOf(walletAddress).call();
        return balance;
    }
}

export default new Token("0x5dea27d7b472015b6f2a30a1166f5b7f3d246696");
