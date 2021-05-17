const SocketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('$lib/logger');

class WebSocket {
    constructor() {
        this.users = [];
        this.sockets = [];
    }

    init(server) {
        this.io = new SocketIO(server);
        this.setListeners();
    }

    close() {
        for (var i = 0; i < this.sockets.length; i++) {
            this.sockets[i].disconnect();
        }

        this.io.close();
    }

    setListeners() {
        this.io.on('connection', this.onConnection.bind(this));
        this.io.on('close', this.onClose.bind(this));
    }

    onConnection(socket) {
        //logger.info('Websocket is now connected');

        try {
            //Decode JSON Web Token
            const token = socket.handshake.query.token;
            const type = socket.handshake.query.type;

            if (token) {
                let currentSocket = this.userSocket;
                let secret = process.env.JWT_ACCESS_SECRET;

                if (type === 'admin') {
                    secret = process.env.JWT_SECRET;
                    currentSocket = this.adminSocket;
                }

                const decoded = jwt.verify(token, secret);
                const userId = decoded.sub;

                this.sockets[socket.id] = socket;

                currentSocket.onConnection(socket, userId);
            }
        } catch (err) {
            //Ignore unauthenticated sockets
            logger.error(err);
        }
    }

    onClose() {
        //logger.info('Websocket connection closed.');
    }
}

let ws = new WebSocket();
module.exports = ws;
