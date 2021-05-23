const express = require('express');
const config = config(); // Website config
const FormData = require('form-data');
const fetch = require('node-fetch');
const redis = require("redis");
const client = redis.createClient();
const ed = require('noble-ed25519');

class LinkController {
    static async verifyToken(req, resp) {
        let {message, signature, publicKey} = req.body;
        console.log(message,signature,publicKey);

        const isSigned = await ed.verify(signature, message, publicKey);
        resp.status(200).send(isSigned);
    }

    static async setToken(req, resp) {
        if (!req.session.token) {
            req.session.token = req.query.token
            client.set(req.query.token, "0", redis.print);
        }

        if (!req.session.bearer_token)
            return resp.redirect('/link/discord') // Redirect to login page

        const data = await fetch(`https://discord.com/api/users/@me`, { headers: { Authorization: `Bearer ${req.session.bearer_token}` } }); // Fetching user data
        const json = await data.json();

        if (!json.username) // This can happen if the Bearer token has expired or user has not given permission "indentity"
            return resp.redirect('/link/discord') // Redirect to login page

        resp.send(`<h1>Hello,#${req.session.token}  ${json.id}#${json.discriminator}!</h1>` +
            `<img src="https://cdn.discordapp.com/avatars/${json.id}/${json.avatar}?size=512">`) // Show user's nametag and avatar

        client.set(req.session.token, "1", redis.print);
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
        req.session.bearer_token = json.access_token;

        resp.redirect('/link'); // Redirecting to main page
    }

    static async discordLogin(req, res) {
        // Redirecting to login url
        res.redirect(`https://discord.com/api/oauth2/authorize` +
            `?client_id=${config.oauth2.client_id}` +
            `&redirect_uri=${encodeURIComponent(config.oauth2.redirect_uri)}` +
            `&response_type=code&scope=${encodeURIComponent(config.oauth2.scopes.join(" "))}`)
    }
}

module.exports.Controller = LinkController;
module.exports.controller = function (app) {
    app.get('/link', LinkController.setToken);
    app.get('/link/discord', LinkController.discordLogin);
    app.get('/link/discord/callback', LinkController.discordCallback);
};
