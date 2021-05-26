import config from 'config';
import FormData from 'form-data';
import fetch from 'node-fetch';
import ed from 'noble-ed25519';
import UserSession from '../models/UserSession.js';
import User from '../models/User.js';

class MainController {
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

    static async login(req, resp) {
        let { publicKey } = req.body;

        let user = await UserSession.getByAddress(publicKey);
        if (user) {
            resp.status(200).send(user);
        } else {
            resp.status(500).send('Invalid address');
        }
    }

    static async updateUser(req, resp){
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

    static async discordCallback(req, resp) {
        const accessCode = req.query.code;
        if (!accessCode) // If something went wrong and access code wasn't given
            return resp.send('No access code specified');

        // Creating form to make request
        const data = new FormData();
        data.append('client_id', config.oauth2.client_id);
        data.append('client_secret', config.oauth2.secret);
        data.append('grant_type', 'authorization_code');
        data.append('redirect_uri', config.oauth2.redirect_uri);
        data.append('scope', 'identify');
        data.append('code', accessCode);

        // Making request to oauth2/token to get the Bearer token
        const json = await (await fetch('https://discord.com/api/oauth2/token', { method: 'POST', body: data })).json();
        let discordInfo = await fetch(`https://discord.com/api/users/@me`, { headers: { Authorization: `Bearer ${json.access_token}` } }); // Fetching user data
        discordInfo = await discordInfo.json();
        console.log(discordInfo);
        resp.redirect(`http://localhost:3000/` +
            `?token=${accessCode}` +
            `&avatar=${discordInfo.avatar}` +
            `&username=${discordInfo.username}` +
            `&discord_id=${discordInfo.id}` + 
            `&provider=discord` + 
            `#/confirmation`);
    }

    static async discordLogin(req, res) {
        // Redirecting to login url
        res.redirect(`https://discord.com/api/oauth2/authorize` +
            `?client_id=${config.oauth2.client_id}` +
            `&redirect_uri=${encodeURIComponent(config.oauth2.redirect_uri)}` +
            `&response_type=code&scope=${encodeURIComponent(config.oauth2.scopes.join(" "))}`)
    }

    static addRoutes(app) {
        app.put('/user/:userId', MainController.validateSignature, MainController.updateUser);
        app.post('/login', MainController.validateSignature, MainController.login);
        app.get('/discord', MainController.discordLogin);
        app.get('/discord/callback', MainController.discordCallback);
    }
}

export default MainController;