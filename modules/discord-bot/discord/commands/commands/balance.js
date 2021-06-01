/* eslint-disable no-restricted-syntax */
// import PriceService from '../../../price/PriceService';
// import Wallet from '../../../wallet';
import { COMMAND_PREFIX } from '../../../config';

import fetch from 'node-fetch';

const body = {
    method: 'getTokenAccountsByOwner',
    jsonrpc: '2.0',
    params: [
    // Get the public key of the account you want the balance for.
        'FidaKmZFztWo5bx7EBwZ1Z7Wra7PeELXKxdoYEGAjodq',
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { encoding: 'jsonParsed', commitment: 'processed' },
    ],
    id: '35f0036a-3801-4485-b573-2bf29a7c77d2',
};

export default {
    name: 'balance-all',
    description: 'Checks the token balance for a given wallet',
    usage: [`${COMMAND_PREFIX}balance-all`],
    async execute(message) {
        const response = await fetch('https://solana-api.projectserum.com/', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });
        let value = '';
        const json = await response.json();
        const resultValues = json.result.value;
        const theOwner = body.params[0];

        message.channel.send(`[+] Token(s) for Address: ${theOwner} [+]\n`);
        for (value of resultValues) {
            const parsedInfo = value.account.data.parsed.info;
            const { mint, tokenAmount } = parsedInfo;
            const uiAmount = tokenAmount.uiAmountString;
            message.channel.send(`Mint: ${mint} | Balance: ${uiAmount}`);
        }
    },
};
