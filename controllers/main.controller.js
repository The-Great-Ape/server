import config from 'config';
import FormData from 'form-data';
import fetch from 'node-fetch';
import ed from 'noble-ed25519';
import UserSession from '../models/UserSession.js';
import UserServer from '../models/UserServer.js';
import Server from '../models/Server.js';
import User from '../models/User.js';
import UserWallet from '../models/UserWallet.js';

class MainController {
    //Signature
    //---------------------------
    static async validateSignature(req, resp, next) {
        let { token, signature, address } = req.body;
        address = Uint8Array.from(address.data);
        signature = Uint8Array.from(signature.data);
        token = new TextEncoder().encode('$GRAPE');
        const isSigned = await ed.verify(signature, token, address);

        if (isSigned) {
            next();
        } else {
            resp.status(500).send('Invalid signature');
        }
    }

    //User
    //---------------------------
    static async login(req, resp) {
        let { publicKey } = req.body;

        let user = await UserSession.getByAddress(publicKey);
        if (user) {
            resp.status(200).send(user);
        } else {
            resp.status(500).send('Invalid address');
        }
    }

    static async register(req, resp) {
        let { userId, publicKey } = req.body;

        let user = await User.getById(userId);
        let userWallet = false;

        if(user){
            userWallet = await UserWallet.createUserWallet(userId, publicKey);
            user.hasWallet = true;
            await user.save();
        }
       
        if (userWallet) {
            let user = await UserSession.getByAddress(publicKey);
            resp.status(200).send(user);
        } else {
            resp.status(500).send('Invalid address');
        }
    }

    static async updateUser(req, resp) {
        const discordId = req.body.discordId;
        const userId = req.params.userId;

        let user = await User.getById(userId);
        user.discordId = discordId;
        await user.save();

        if (user) {
            resp.status(200).send(user);
        } else {
            resp.status(500).send('Invalid address');
        }
    }

    //Server
    //---------------------------
    static async getServers() {
        let servers = await Server.getServers();

        if (servers) {
            resp.status(200).send(servers);
        } else {
            resp.status(500).send('Missing servers');
        }
    }

    static async registerServer(req, resp) {
        const {userId} = req.body;
        const {serverId} = req.params;
        console.log(userId, serverId);

        let userServer = await UserServer.createUserServer(userId, serverId);

        if (userServer) {
            resp.status(200).send(userServer);
        } else {
            resp.status(500).send('Invalid server');
        }
    }

    static async unregisterServer(req, resp) {
        const {userId} = req.body;
        const {serverId} = req.params;

        let userServer = await UserServer.deleteUserServer(userId, serverId);

        if (userServer) {
            resp.status(200).send(userServer);
        } else {
            resp.status(500).send('Invalid server');
        }
    }

    //Discord
    //---------------------------
    static async discordLogin(req, res) {
        //create pendingUser record
        let state = encodeURIComponent(JSON.stringify({
            register: req.query.register,
            serverId: req.query.serverId
        }));

        res.redirect(`https://discord.com/api/oauth2/authorize` +
            `?client_id=${process.env.DISCORD_OAUTH_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(process.env.DISCORD_OAUTH_REDIRECT_URL)}` +
            (req.query.register && `&state=${state}`) +
            `&response_type=code&scope=${encodeURIComponent(config.discord.scopes.join(" "))}`)
    }

    static async discordCallback(req, resp) {
        let { state } = req.query;
        const accessCode = req.query.code;

        state = state && JSON.parse(decodeURIComponent(state));
        let register = state.register;
        let serverId = state.serverId;

        console.log({serverId});

        if (!accessCode)
            return resp.send('No access code specified');

        const data = new FormData();
        data.append('client_id', process.env.DISCORD_OAUTH_CLIENT_ID);
        data.append('client_secret', process.env.DISCORD_OAUTH_SECRET);
        data.append('grant_type', 'authorization_code');
        data.append('redirect_uri', process.env.DISCORD_OAUTH_REDIRECT_URL);
        data.append('scope', 'identify');
        data.append('code', accessCode);

        const json = await (await fetch('https://discord.com/api/oauth2/token', { method: 'POST', body: data })).json();
        console.log(json);
        let discordInfo = await fetch(`https://discord.com/api/users/@me`, { headers: { Authorization: `Bearer ${json.access_token}` } }); // Fetching user data
        discordInfo = await discordInfo.json();
        const discordId = discordInfo && discordInfo.id;
        let userId, server;

        if(register){
            let user = discordId && await User.createUser(discordId);
            userId = user && user.userId;   
            
            console.log(serverId);
            server = await Server.getById(serverId);

            if(server && userId){
                await UserServer.createUserServer(userId, serverId);
            }
        }

        resp.redirect(process.env.CLIENT_URL +
            `?token=${accessCode}` +
            `&avatar=${discordInfo.avatar}` +
            `&username=${discordInfo.username}` +
            `&serverName=${server && server.name}` + 
            `&serverLogo=${server && encodeURIComponent(server.logo)}` + 
            `&discord_id=${discordId}` +
            `&user_id=${userId}` +
            `&provider=discord` +
            (register ? `#/register` : `#/confirmation`));
    }

    static addRoutes(app) {
        app.put('/api/user/:userId', MainController.validateSignature, MainController.updateUser);
        app.post('/api/register', MainController.register);
        app.post('/api/login', MainController.validateSignature, MainController.login);
        app.get('/api/server', MainController.validateSignature, MainController.getServers);
        app.post('/api/server/:serverId/register', MainController.validateSignature, MainController.registerServer);
        app.post('/api/server/:serverId/unregister', MainController.validateSignature, MainController.unregisterServer);
        app.get('/api/discord', MainController.discordLogin);
        app.get('/api/discord/callback', MainController.discordCallback);
    }
}

export default MainController;