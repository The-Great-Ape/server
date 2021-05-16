/*-------------
Dependencies
---------------*/
require('dotenv').config();
require('module-alias/register');

const mongoose = require('mongoose'),
    fs = require('fs'),
    jwt = require('jsonwebtoken'),
    cors = require('cors'),
    express = require('express'),
    walkDir = require('walkdir'),
    logger = require('./lib/logger'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    helmet = require('helmet'),
    compression = require('compression'),
    passport = require('passport'),
    acl = require('express-acl'),
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
        this.port = this.port ? this.port : parseInt(process.env.PORT || 4000, 10);
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

        //Body Parser
        this.app.use(bodyParser.json({}));
        this.app.use(bodyParser.urlencoded({
            extended: false
        }));

        logger.info(`Worker ${process.pid}: [Express]: Initialized`);
    }

    //CORs
    initCORS() {
        const allowedOrigins = [
            'localhost:3000',
            undefined,
            null];

        let allowLocalhost = ['development', 'dev', 'qa', 'stage', 'staging'];

        if (allowLocalhost.indexOf(process.env.NODE_ENV) > -1) {
            allowedOrigins.push('http://localhost:3000');
            allowedOrigins.push('http://localhost:3001');
            allowedOrigins.push('http://localhost:3002');
            allowedOrigins.push('http://localhost:3003');
            allowedOrigins.push('http://localhost:3004');
        }

        const corsOptions = {
            origin: function (origin, callback) {
                if (allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    logger.error('[Cors]: Invalid origin: ' + origin);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
            allowedHeaders: 'X-Requested-With,content-type,token,Authorization, set-cookie',
            credentials: true,
            exposedHeaders: 'token'
        };

        this.app.use(cors(corsOptions));
    }

    //ACL
    async initACL() {
        try {
            acl.config({
                decodedObjectName: 'token',
                filename: 'nacl.json',
                path: 'common',
                // roleSearchPath:'role.group',
                denyCallback: res => {
                    return res.status(403).json({
                        status: 'Access Denied',
                        success: false,
                        message: 'You are not authorized to access this resource'
                    });
                }
            });

            this.app.use(acl.authorize);
            logger.info(`Worker ${process.pid}: [ACL]: Initialized`);
        } catch (err) {
            logger.error(err);
        }
    }

    //Mongoose
    async initMongoose() {
        const url = process.env.MONGODB_URL;
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

    //Passport
    initPassport() {
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        require('../../common/passport/auth')(passport);

        this.app.use((req, res, next) => {
            const token = req.headers['token'];

            if (token) {
                jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
                    if (err) {
                        //check for admin token...
                        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                            if (err) {
                                res.status(401);
                                return res.send(err);
                            }

                            req.decoded = decoded;
                            next();
                        });
                    }
                    else {
                        req.decoded = decoded;
                        next();
                    }
                });
            }
            else {
                next();
            }
        });
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

    //Websocket
    initSockets() {
        try {
            let websocket = require('../websocket/websocket');
            websocket.init(this.server);
            this.websocket = websocket;
            logger.info(`Worker ${process.pid}: [Websocket]: Initialized`);
        } catch (err) {
            logger.error(err);
        }
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

        //this.initCORS();
        //this.initPassport();
        //this.initSockets();
        //await this.initACL();

        this.initSchemas();
        this.initExpress();
        this.initControllers();


        const ErrorHandler = require('$lib/error-handler');

        this.app.use((err, req, res, next) => {
            ErrorHandler.handleError(err, req, res, next);
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
