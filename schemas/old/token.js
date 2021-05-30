import Web3 from 'web3';

const rpcURL = process.env.ETH_RPC_URL;
const web3 = new Web3(rpcURL);

// The minimum ABI to get ERC20 Token balance
const minABI = [
    // balanceOf
    {
        'constant': true,
        'inputs': [{ 'name': '_owner', 'type': 'address' }],
        'name': 'balanceOf',
        'outputs': [{ 'name': 'balance', 'type': 'uint256' }],
        'type': 'function'
    },
    // decimals
    {
        'constant': true,
        'inputs': [],
        'name': 'decimals',
        'outputs': [{ 'name': '', 'type': 'uint8' }],
        'type': 'function'
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

export default new Token('0xb2279b6769cfba691416f00609b16244c0cf4b20');
