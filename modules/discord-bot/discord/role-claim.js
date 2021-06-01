import User from '../../../models/User';
import firstMessage from './first-message';
import fetch from 'node-fetch';

export default (client) => {
	// Read from Channel
    const channelId = '848506777049235476';

    const getEmoji = (emojiName) => client.emojis.cache.find((emoji) => emoji.name === emojiName);

	// Uploaded server Emojis
    const emojis = {
        walletv2: 'Verified Wallet',
        medianetwork: 'MEDIA Holder',
        mercurial: 'Mercurial Holder',
        samo: 'SAMO Holder',
    };

    const reactions = [];
    
    // Welcome text which is rebuilt everytime

    let emojiText = "Gated SPL token community access!\n https://verify.grapes.network\n 0.1 MEDIA for Media access \n 10 MER for Mercurial access \n 10,000 SAMO for Samo access \n \n";
    for (const key in emojis) {
        const emoji = getEmoji(key);
        reactions.push(emoji);

        const role = emojis[key];
        emojiText += `${emoji} = ${role}\n`;
    }

    firstMessage(client, channelId, emojiText, reactions);

    const handleReaction = async (reaction, user, add) => {
        if (user.id === process.env.DISCORD_BOT_ID) {
            return;
        }

        const emoji = reaction._emoji.name;

        const { guild } = reaction.message;

        const roleName = emojis[emoji];
        if (!roleName) {
            return;
        }

        const role = guild.roles.cache.find((role) => role.name === roleName);
        const member = guild.members.cache.find((member) => member.id === user.id);


// logic on add reaction

        if (add) {
          
           
           
           // Check which role the user is clicking for
           
                      
           if(role.name === 'Verified Wallet' )
           		{
	           		// Just check that a wallet exists
	           		// console.log(role.name);
	           		 
	           		   const discordId = member.id;
			   		   const dbDiscordId = await User.getByDiscordId(discordId);
			   		  // console.log(discordId,dbDiscordId);
			   		   if (discordId===dbDiscordId)
			   		   		member.roles.add(role);
	           		
           		}
           
           
           if(role.name === 'MEDIA Holder' )
           		{
	           		// Check wallet exists + specific token
	           		
	           		const discordId = member.id;
			   		const dbDiscordId = await User.getByDiscordId(discordId);
			   		// if the user is has a verified wallet, now lets check specific token balance
			   		 	if (discordId===dbDiscordId)
			   		 		{
				   		 		
				   		 		// Get Wallet Address
				   		 		
				   		 		const DiscordWallet = await User.getWalletByDiscordId(discordId);
				   		 		console.log(DiscordWallet);
				   		 		const body = {
				   		 		method: 'getTokenAccountsByOwner',
				   		 		jsonrpc: '2.0',
				   		 		params: [
				   		 		// Get the public key of the account you want the balance for.
				   		 			DiscordWallet,
				   		 			{ programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
				   		 			{ encoding: 'jsonParsed', commitment: 'processed' },
				   		 			],
				   		 			id: '35f0036a-3801-4485-b573-2bf29a7c77d2',
												};
									const response = await fetch('https://solana-api.projectserum.com/', {
									method: 'POST',
									body: JSON.stringify(body),
									headers: { 'Content-Type': 'application/json' },
									});
									let value = '';
									const json = await response.json();
									const resultValues = json.result.value;
									const theOwner = body.params[0];
									
									for (value of resultValues) 
										{
											const parsedInfo = value.account.data.parsed.info;
											const { mint, tokenAmount } = parsedInfo;
											const uiAmount = tokenAmount.uiAmountString;
											//console.log(mint);
											//message.channel.send(`Mint: ${mint} | Balance: ${uiAmount}`);
										// Check for Media Token over 0.1
										// MEDIA ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs
										//EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v USDC
											if (mint=== 'ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs' )
											
												{
													
													if (uiAmount>0.099)
														{
															member.roles.add(role);
															
														}
													
												}
										}


				   		 		
				   		 		
				   		 		
			   		 		}
	           		 
	           		 
	           		
           		}
           		// End MEDIA
           		
           		 if(role.name === 'Mercurial Holder' )
           		{
	           		// Check wallet exists + specific token
	           		
	           		const discordId = member.id;
			   		const dbDiscordId = await User.getByDiscordId(discordId);
			   		// if the user is has a verified wallet, now lets check specific token balance
			   		 	if (discordId===dbDiscordId)
			   		 		{
				   		 		
				   		 		// Get Wallet Address
				   		 		
				   		 		const DiscordWallet = await User.getWalletByDiscordId(discordId);
				   		 		console.log(DiscordWallet);
				   		 		const body = {
				   		 		method: 'getTokenAccountsByOwner',
				   		 		jsonrpc: '2.0',
				   		 		params: [
				   		 		// Get the public key of the account you want the balance for.
				   		 			DiscordWallet,
				   		 			{ programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
				   		 			{ encoding: 'jsonParsed', commitment: 'processed' },
				   		 			],
				   		 			id: '35f0036a-3801-4485-b573-2bf29a7c77d2',
												};
									const response = await fetch('https://solana-api.projectserum.com/', {
									method: 'POST',
									body: JSON.stringify(body),
									headers: { 'Content-Type': 'application/json' },
									});
									let value = '';
									const json = await response.json();
									const resultValues = json.result.value;
									const theOwner = body.params[0];
									
									for (value of resultValues) 
										{
											const parsedInfo = value.account.data.parsed.info;
											const { mint, tokenAmount } = parsedInfo;
											const uiAmount = tokenAmount.uiAmountString;
											//console.log(mint);
											//message.channel.send(`Mint: ${mint} | Balance: ${uiAmount}`);
										// Check for Media Token over 0.1
										// MEDIA ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs
										//EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v USDC
											if (mint=== 'MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K' )
											
												{
													
													if (uiAmount>9.99)
														{
															member.roles.add(role);
															
														}
													
												}
										}


				   		 		
				   		 		
				   		 		
			   		 		}
	           		 
	           		 
	           		
           		}
           		 if(role.name === 'SAMO Holder' )
           		{
	           		// Check wallet exists + specific token
	           		
	           		const discordId = member.id;
			   		const dbDiscordId = await User.getByDiscordId(discordId);
			   		// if the user is has a verified wallet, now lets check specific token balance
			   		 	if (discordId===dbDiscordId)
			   		 		{
				   		 		
				   		 		// Get Wallet Address
				   		 		
				   		 		const DiscordWallet = await User.getWalletByDiscordId(discordId);
				   		 		console.log(DiscordWallet);
				   		 		const body = {
				   		 		method: 'getTokenAccountsByOwner',
				   		 		jsonrpc: '2.0',
				   		 		params: [
				   		 		// Get the public key of the account you want the balance for.
				   		 			DiscordWallet,
				   		 			{ programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
				   		 			{ encoding: 'jsonParsed', commitment: 'processed' },
				   		 			],
				   		 			id: '35f0036a-3801-4485-b573-2bf29a7c77d2',
												};
									const response = await fetch('https://solana-api.projectserum.com/', {
									method: 'POST',
									body: JSON.stringify(body),
									headers: { 'Content-Type': 'application/json' },
									});
									let value = '';
									const json = await response.json();
									const resultValues = json.result.value;
									const theOwner = body.params[0];
									
									for (value of resultValues) 
										{
											const parsedInfo = value.account.data.parsed.info;
											const { mint, tokenAmount } = parsedInfo;
											const uiAmount = tokenAmount.uiAmountString;
											//console.log(mint);
											//message.channel.send(`Mint: ${mint} | Balance: ${uiAmount}`);
										// Check for Media Token over 0.1
										// MEDIA ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs
										//EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v USDC
											if (mint=== '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' )
											
												{
													
													if (uiAmount>9999.99)
														{
															member.roles.add(role);
															
														}
													
												}
										}


				   		 		
				   		 		
				   		 		
			   		 		}
	           		 
	           		 
	           		
           		}
           
           
           
           
           
            
            
            
            
        }
    // else {
    //   member.roles.remove(role);
    // }
    };

    client.on('messageReactionAdd', async (reaction, user) => {
        if (reaction.message.channel.id === channelId) {
            await handleReaction(reaction, user, true);
        }
    });

    client.on('guildMemberAdd', async member => {
        if (member.user.bot) return;

        //member.roles.add(member.guild.roles.cache.find((role) => role.name === 'MEDIA Holder'));
    });

    // client.on('messageReactionRemove', (reaction, user) => {
    //   if (reaction.message.channel.id === channelId) {
    //     handleReaction(reaction, user, false);
    //   }
    // });
};
