import config from 'config';
import FormData from 'form-data';
import fetch from 'node-fetch';
import ed from 'noble-ed25519';
import UserSession from '../models/UserSession.js';
import UserServer from '../models/UserServer.js';
import Server from '../models/Server.js';
import User from '../models/User.js';

class MainController {
    //Signature
    //---------------------------
    static async validateSignature(req, resp, next) {
        let { token, signature, address } = req.body;
        address = Uint8Array.from(address.data);
        signature = Uint8Array.from(signature.data);
        token = new TextEncoder().encode('helloworld');
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
    static async getServers(){
        let servers = await Server.getServers();

        if (servers) {
            resp.status(200).send(servers);
        } else {
            resp.status(500).send('Missing servers');
        }
    }

    static async registerServer(req, resp) {
        const serverId = req.body.serverId;
        const userId = req.params.userId;

        let userServer = await UserServer.createrUserServer(userId, serverId);

        if (userServer) {
            resp.status(200).send(userServer);
        } else {
            resp.status(500).send('Invalid server');
        }
    }

    static async unregisterServer(req, resp) {
        const serverId = req.body.serverId;
        const userId = req.params.userId;

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
        res.redirect(`https://discord.com/api/oauth2/authorize` +
            `?client_id=${process.env.DISCORD_OAUTH_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(process.env.DISCORD_OAUTH_REDIRECT_URL)}` +
            `&response_type=code&scope=${encodeURIComponent(config.discord.scopes.join(" "))}`)
    }

    static async discordCallback(req, resp) {
        const accessCode = req.query.code;
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
        let discordInfo = await fetch(`https://discord.com/api/users/@me`, { headers: { Authorization: `Bearer ${json.access_token}` } }); // Fetching user data
        discordInfo = await discordInfo.json();
        console.log(discordInfo);

        resp.redirect(process.env.CLIENT_URL +
            `?token=${accessCode}` +
            `&avatar=${discordInfo.avatar}` +
            `&username=${discordInfo.username}` +
            `&discord_id=${discordInfo.id}` +
            `&provider=discord` +
            `#/confirmation`);
    }

    static addRoutes(app) {
        app.put('/user/:userId', MainController.validateSignature, MainController.updateUser);
        app.post('/login', MainController.validateSignature, MainController.login);
        app.get('/server', MainController.validateSignature, MainController.getServers);
        app.put('/server/:serverId/user/:userId', MainController.validateSignature, MainController.registerServer);
        app.delete('/server/:serverId/user/:userId', MainController.validateSignature, MainController.unregisterServer);
        app.get('/discord', MainController.discordLogin);
        app.get('/discord/callback', MainController.discordCallback);
    }
}

export default MainController;