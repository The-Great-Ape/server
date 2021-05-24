/*-------------
Dependencies
---------------*/
require('dotenv').config();
require('module-alias/register');

const mongoose = require('mongoose'),
    fs = require('fs'),
    cors = require('cors'),
    express = require('express'),
    walkDir = require('walkdir'),
    logger = require('./lib/logger'),
    morgan = require('morgan'),
    helmet = require('helmet'),
    compression = require('compression'),
    config = require('config'),
    util = require('./lib/util'),
    session = require('express-session'),
    path = require('path');

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
        this.port = this.port ? this.port : parseInt(config.PORT || 4000, 10);
        try {
            //await this.initMongoose();

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

        //use GZip
        this.app.use(compression());

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

        //Session
        this.app.use(session(config.session));

        logger.info(`Worker ${process.pid}: [Express]: Initialized`);
    }

    //CORs
    initCORS() {
        this.app.use(cors());
    }

    //Mongoose
    async initMongoose() {
        const url = process.env.MONGODB_URL || 'localhost:27017';
        const dbConfig = {
            useUnifiedTopology: true,
            retryWrites: false,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            socketTimeoutMS: 600000,
            poolSize: 50
        };

        this.db = await mongoose.connect(url, dbConfig);
        this.db.close = mongoose.disconnect;
        global.db = mongoose.connection.db;

        logger.info(`Worker ${process.pid}: Mongo DB is now connected`);
    }

    //Controllers
    initControllers() {
        //Dynamically include controllers
        fs.readdirSync('./controllers').forEach(function (file) {
            if (file.substr(-3) === '.js' && file.substr(-7) !== 'spec.js') {
                require('./controllers/' + file).controller(this.app);
            }
        }.bind(this));
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

    //Schemas
    async initSchemas() {
        //Dynamically register mongoose schemas to be used without model requires
        try {
            const schemasLocation = './schemas/';
            const schemasDir = path.join(__dirname, schemasLocation);
            const files = walkDir.sync(schemasDir);

            if (Array.isArray(files)) {
                files.forEach(filepath => {
                    if (filepath.match(/\.schema\.js$/)) require(filepath);
                });
            }

            logger.info(`Worker ${process.pid}: [Schemas]: Initialized`);
        } catch (err) {
            logger.error(err);
        }
    }

    //State
    async onListening() {
        this.initLogs();

        logger.info(`Worker ${process.pid}: Listening on port ${this.port}, in ${process.env.NODE_ENV}`);

        this.initCORS();
        //this.initPassport();
        //this.initSockets();
        //await this.initACL();

        this.initSchemas();
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
                    logger.info(`Worker ${process.pid}: MongoDB connection closed.`);
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
