<h1 align="center">
  <br>
   <img width="200" src="https://lh3.googleusercontent.com/nUInrc-957mkMjJT1JqwCUdUbO7ZObQMPbe4dzPFXUnS9SUnIjyr9f6drawTZ3IOQFjXHtRIph_cyL2IK-Zbmqq8lpm17ZNw60ta7g=s0" alt="logo GRAPE"/>
  <br>
</h1>

# GRAPE ACCESS

## SPL Token gated communities on Discord
Connecting members social accounts to unique cryptographic keys is the core of our Dynamic Balance-Based Membership solution.

### Prerequisites
1. Must have an existing Discord server with at least a blank channel (Read-only channel).
2. Invite the bot to your server using the following link: ```https://discord.com/oauth2/authorize?client_id=<YOUR_APPLICATION_CLIENT_ID>&scope=bot``` (replace YOUR_APPLICATION_CLIENT_ID with your respective application client ID from Discord).
3. Upload 4 customs server emojis, and create appropriate roles for assigning to users (reacting with emojis).
  
  Currently we are using the following emoji - role pairs:
  
  ```javascript
  // Uploaded server Emojis
    const emojis = {
        walletv2: 'Verified Wallet',
        medianetwork: 'MEDIA Holder',
        mercurial: 'Mercurial Holder',
        samo: 'SAMO Holder',
    };
  ```
   Input the ID of you're read-only welcome channel in /modules/discord-bot/discord/role-claim.js file.
  ```javascript
  export default (client) => {
    // Read from Channel
    const channelId = 'Paste read-only channel ID';

    const getEmoji = (emojiName) => client.emojis.cache.find((emoji) => emoji.name === emojiName);
  ```
  
4. Install [PostgresSQL](https://www.postgresql.org/).
5. Rename the .env.example file to .env and fill in the following variables:
  ```
  ODE_ENV = dev

  API_PORT = 5000

  #DATABASE
  DB_USER = graperoot
  DB_HOST = postgres
  DB_PASSWORD = elephant
  DB_NAME = grape
  DB_PORT = 5432

  #POSTGRES DOCKER
  POSTGRES_PASSWORD =
  POSTGRES_DB = #should be same as DB_NAME

  #PG ADMIN (OPTIONAL)
  PGADMIN_DEFAULT_EMAIL = toto@test.com
  PGADMIN_DEFAULT_PASSWORD = 123456
  PG_ADMIN_PORT = 5050

  #NGINX
  NGINX_ENVSUBST_TEMPLATE_SUFFIX = .conf

  CLIENT_URL = http://localhost/ # where client is being served from (e.g localhost)

  DISCORD_OAUTH_REDIRECT_URL = http://localhost/api/discord/callback # Discord callback endpoint
  DISCORD_OAUTH_CLIENT_ID = # Get from Discord
  DISCORD_OAUTH_SECRET =  # Get from Discord
  DISCORD_BOT_TOKEN = # Get from Discord
  DISCORD_BOT_ID = # Get from Discord

  ETH_RPC_URL = # https://mainnet.infura.io/v3/<INFURA.IO_API_KEY>
  
  DISCORD_CHANNEL_ID = 

  DISCORD_ROLE_1 =Verified Wallet 
  DISCORD_ROLE_2 =MEDIA Holder 
  DISCORD_ROLE_3 =Mercurial Holder 
  DISCORD_ROLE_4 =SAMO Holder
  
  MINT_TOKEN_1 =ETAtLmCmsoiEEKfNrHKJ2kYy3MoABhU6NQvpSfij5tDs 
  MINT_TOKEN_2 =MERt85fc5boKw3BW1eYdxonEuJNvXbiMbs6hvheau5K
  MINT_TOKEN_3 =7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU 
  
  MINT_MIN_BALANCE_1 =0.099
  MINT_MIN_BALANCE_2 =9.99
  MINT_MIN_BALANCE_3 =9999.99

  ```
 6. Clone ane deploy client from this repository: https://github.com/The-Great-Ape/client

### Deployment
+ Clone this repository.
+ Install dependencies using: ``` npm install ```
+ Start up server using: ``` npm start ```
+ Start up Discord bot using ``` npm run bot ```

### Features
- Validate Solana wallet ownership.
- Validate Discordid ownership.
- Creates a link between the validated discord id and validated  Wallet.
- Allows token balance rules to obtain roles on Discord and gate channel access based on ownership.


## Acknowledgements
* This project uses [Solana](https://solana.com/). A fast, secure, and censorship resistant blockchain providing the open infrastructure required for global adoption.
* This project uses  [Discord](https://discord.com/brand-new). A VoIP, instant messaging and digital distribution platform designed for creating communities.
* The project uses parts of [Solbot](https://github.com/paul-schaaf/solbot) by Paul Schaaf, a tipping bot for Solana.
* This project uses [Project Serum's markets](https://projectserum.com/). An ecosystem that brings unprecedented speed and low transaction costs to decentralized finance.
* This project uses [noble-ed25519](https://github.com/paulmillr/noble-ed25519). Fastest JS implementation of ed25519, an elliptic curve that could be used for asymmetric encryption and EDDSA signature scheme.
* This project uses [Serum Price API](https://github.com/sonar-watch/serum-price-api) by Sonar

If you are having difficulty with this application please contact BillysDiscord#5191 or DeanMachine#9058 or GintoniQ#3987 on Discord for assistance and access
to a live working Demo.
