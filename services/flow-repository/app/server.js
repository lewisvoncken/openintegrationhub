/* eslint no-unused-expressions: "off" */
/* eslint no-underscore-dangle: "off" */
/* eslint max-len: "off" */
/* eslint consistent-return: "off" */

const express = require('express');

const swaggerUi = require('swagger-ui-express');
const iamMiddleware = require('@openintegrationhub/iam-utils');
const cors = require('cors');
const config = require('./config/index');
const flow = require('./api/controllers/flow');
const { connectQueue, disconnectQueue } = require('./utils/eventBus');
const startstop = require('./api/controllers/startstop');
const healthcheck = require('./api/controllers/healthcheck');
const swaggerDocument = require('./api/swagger/swagger.json');


const log = require('./config/logger');

class Server {
  constructor() {
    this.app = express();
    this.app.disable('x-powered-by');
  }

  async setupCors() {
    const whitelist = config.originWhitelist;

    // For development, add localhost to permitted origins
    if (process.env.NODE_ENV !== 'production') {
      whitelist.push('http://localhost:3001');
    }

    const corsOptions = {
      origin(origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          log.info('Blocked by CORS');
          log.info(origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
    };

    // enables CORS
    this.app.use('/flows', cors(corsOptions));

    // Enables preflight OPTIONS requests
    this.app.options('/', cors());
  }

  async setupMiddleware() {
    log.info('Setting up middleware');

    // This middleware simple calls the IAM middleware to add user data to req.
    this.app.use('/flows', async (req, res, next) => {
      try {
        await iamMiddleware.middleware(req, res, next);
      } catch (error) {
        return res.status(401).send({ errors: [{ message: `Authentication middleware failed with error: ${error}`, code: 401 }] });
      }
    });


    // This middleware compiles the relevant membership ids generated by the IAM iam middleware and passes them on
    this.app.use('/flows', async (req, res, next) => {
      // Checks whether iam middleare successfully added Heimdal object
      if (!req.__HEIMDAL__) {
        return res.status(401).send({ errors: [{ message: 'Authentication middleware did not find data' }] });
      }

      if (this.mongoose.connection.readyState !== 1) {
        return res.status(500).send({ errors: [{ message: `NO DB. Please try again later ${this.mongoose.connection.readyState}`, code: 500 }] });
      }

      // local copy of the user object
      const user = req.__HEIMDAL__;

      // A flag that shows the current user is an OIH admin, allowing them to see all flows irrespective of ownership
      if (config.oihViewerRoles.includes(user.role)) {
        res.locals.admin = true;
      }

      // Two-dimensional array that will hold the user's id and memberships. First row contains ids with read/write permissions, second row contains ids with read permissions.
      let credentials = [[], []];

      if (config.usePermissions) {
        if (user.permissions.includes(config.flowReadPermission)) {
          credentials[1].push(user.sub);
        }

        if (user.permissions.includes(config.flowWritePermission)) {
          credentials[0].push(user.sub);
        }

        // Pushes the ids of the tenants to the credentials array. If the user role allows writing of tenant flows, the id is pushed to the read/write and the read rows of the array. Otherwise the id is pushed only to the read row.
        for (let i = 0; i < user.memberships.length; i += 1) {
          if (user.memberships[i].permissions.includes(config.flowReadPermission)) {
            credentials[1].push(user.memberships[i].tenant);
          }
          if (user.memberships[i].permissions.includes(config.flowWritePermission)) {
            credentials[0].push(user.memberships[i].tenant);
          }
        }
      } else {
        // Adds the user's id to the credentials array, meaning that the user can always create flows, and view and edit those they have personally created.

        credentials = [[user.sub], [user.sub]];

        // Pushes the ids of the tenants to the credentials array. If the user role allows writing of tenant flows, the id is pushed to the read/write and the read rows of the array. Otherwise the id is pushed only to the read row.
        for (let i = 0; i < user.memberships.length; i += 1) {
          if (config.tenantWriterRoles.includes(user.memberships[i].role)) {
            credentials[0].push(user.memberships[i].tenant);
          }
          credentials[1].push(user.memberships[i].tenant);
        }
      }

      res.locals.credentials = credentials; // Passes on the tenancies that the user is a member of
      return next();
    });

    log.info('Middleware set up');
  }

  async setupQueue() {  // eslint-disable-line
    log.info('Connecting to Queue');
    await connectQueue();
  }

  async terminateQueue() {  // eslint-disable-line
    log.info('Disconnecting from Queue');
    await disconnectQueue();
  }

  setupRoutes() {
    // configure routes
    this.app.use('/flows', flow);
    this.app.use('/flows', startstop);
    this.app.use('/healthcheck', healthcheck);

    // Reroute to docs
    this.app.use('/docs', (req, res) => {
      res.redirect('/api-docs');
    });

    // Error handling
      this.app.use(function (err, req, res, next) { // eslint-disable-line
      return res.status(err.status || 500).send({ errors: [{ message: err.message, code: err.status }] });
    });

    log.info('Routes set');
  }

  async setup(mongoose) {
    log.info('Connecting to mongoose');
    // Configure MongoDB
    // Use the container_name, bec containers in the same network can communicate using their service name
    this.mongoose = mongoose;

    const options = {
      keepAlive: 1, connectTimeoutMS: 30000, reconnectInterval: 1000, reconnectTries: Number.MAX_VALUE, useNewUrlParser: true,
    }; //

    // Will connect to the mongo container by default, but to localhost if testing is active
    mongoose.connect(config.mongoUrl, options);

    // Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise;  // eslint-disable-line
    // Get the default connection
    this.db = mongoose.connection;
    // Bind connection to error event (to get notification of connection errors)
    this.db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    log.info('Connecting done');
  }

  setupSwagger() {
    log.info('adding swagger api');
    // Configure the Swagger-API
    /*eslint-disable */
        var config = {
          appRoot: __dirname, // required config

          // This is just here to stop Swagger from complaining, without actual functionality

          swaggerSecurityHandlers: {
            Bearer: function (req, authOrSecDef, scopesOrApiKey, cb) {
              if (true) {
                cb();
              } else {
                cb(new Error('access denied!'));
              }
            }
          }
        };
        /* eslint-enable */

    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));
  }

  listen(port) {
    const cport = typeof port !== 'undefined' ? port : 3001;
    log.info(`opening port ${cport}`);
    return this.app.listen(cport);
  }
}

module.exports = Server;
