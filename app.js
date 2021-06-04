/*-------------
Dependencies
---------------*/

//modules
import 'dotenv/config.js';

import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import helmet from 'helmet';
import config from 'config';
import session from 'express-session';

//lib
import db from './lib/db.js';
import util from './lib/util.js';
import logger from './lib/logger.js';

//controllers
import MainController from './controllers/main.controller.js';

class App {
    constructor(port) {
        //props
        this.port = port || null;

        //refs
        this.server = null;
        this.db = null;
        this.websocket = null;

        //states
        this.isClosing = false;
    }

    /*-------------
    Commands
    ---------------*/
    start() {
        this.initServer();
    }

    async initServer() {
        this.app = express();
        this.port = this.port ? this.port : parseInt(process.env.API_PORT || 5000, 10);

        try {
            await this.initDB();

            this.server = this.app.listen(this.port);
            this.server.on('listening', this.onListening.bind(this));
            this.server.on('error', this.onError.bind(this));

            process.on('SIGINT', this.stopServer.bind(this));
        } catch (error) {
            logger.error(error);
            process.exit(1);
        }
    }

    /*-------------
    Modules
    ---------------*/
    //Express
    initExpress() {
        //Helmet - simple security headers
        this.app.use(helmet());

        //Default No Cache
        this.app.use((req, res, next) => {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            next();
        });

        //Pass API version
        this.app.use((req, res, next) => {
            res.set('Api-Version', process.env.npm_package_version);
            next();
        });

        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());

        //Session
        this.app.use(session(config.session));

        //Errors
        this.app.use((err, req, res, next) => {
            if (err.message === 'Access denied') {
                res.status(403);
                res.json({ error: err.message });
            }

            next(err);
        });

        logger.info(`Worker ${process.pid}: [Express]: Initialized`);
    }

    //CORs
    initCORS() {
        this.app.use(cors());
    }

    //Mongoose
    async initDB() {
        await db.syncTables();
        logger.info(`Worker ${process.pid}: [Postgres]: Connected.`);
    }

    //Controllers
    initControllers() {
        MainController.addRoutes(this.app);
    }

    //Logs
    initLogs() {
        const logType = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

        this.app.use(
            morgan(logType, {
                skip: function (req, res) {
                    return res.statusCode < 400;
                },
                stream: process.stderr
            })
        );
    }

    //State
    async onListening() {
        this.initLogs();

        logger.info(`Worker ${process.pid}: Listening on port ${this.port}, in ${process.env.NODE_ENV}`);

        this.initCORS();
        this.initExpress();
        this.initControllers();

        this.app.use((err, req, res, next) => {
            util.handleError(err, req, res, next);
        });
    }

    async stopServer() {
        logger.info(`Worker ${process.pid}: Shutting down...`);

        //Close DB
        if (this.db) {
            await this.db.close(err => {
                if (err) {
                    this.onError(err);
                } else {
                    logger.info(`Worker ${process.pid}: [Postgres]: Connection closed.`);
                }
            });
        }

        //Close Websocket
        if (this.websocket) {
            this.websocket.close(err => {
                logger.warn(`Worker ${process.pid}: [WebSocket]: Closing connection...`);

                if (err) {
                    this.onError(err);
                } else {
                    logger.warn(`Worker ${process.pid}: [WebSocket]: Connection closed.`);
                }
            });
        }

        this.server.close();

        if (this.isClosing) {
            process.exit(1);
        } else {
            logger.warn('Shutdown in progress... (Close again to force shutdown)');
            this.isClosing = true;
        }
    }

    onError(err) {
        logger.error(err);
    }

    async onClose() {
        logger.warn('Server is closed.');
        process.exit(1);
    }
}

let app = new App();
app.start();
