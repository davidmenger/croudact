/*
 * @author wingbot.ai
 */
'use strict';

const config = {

    environment: process.env.NODE_ENV || 'development',

    isProduction: false,

    prefix: process.env.PREFIX || 'croudact-development',

    // where the assets or html views are stored
    appUrl: 'http://localhost:3000',

    // where the application API lays
    apiUrl: 'http://localhost:3000',

    botService: {
        appId: process.env.BOT_APP_ID || 'b73e9255-5cec-43b3-b4af-4f509ac865ef',
        appSecret: process.env.BOT_APP_PASSWORD || 'tOAzdw0[tmfiHFifwtmMi0ayG61c=V+_'
    },

    wingbot: {
        bot: 'croudact',
        botId: '8f1c791f-398a-435a-a661-ee9ffae54439',
        snapshot: 'development',
        token: 'WvqxooPp9kq6AyOnA0RQuE9Am2n4AAcRjBQ4V9WTlXmL83DKfoqQRzMfVlQkbkNN6K2L2fVUA1CwQy8cgUU3KpPdLuOTn4j7y8aAupRLqvqWMQn94tFYqCbd2r1AHUZK',
        ai: 'croudact-development'
    },

    db: {
        url: process.env.MONGODB_CONNECTION_STRING || 'mongodb://127.0.0.1:27017/croudact',

        db: 'croudact',

        options: {
            poolSize: 3,
            autoReconnect: true,
            useNewUrlParser: true,
            haInterval: 5000,
            reconnectTries: 1200,
            connectTimeoutMS: 5000,
            socketTimeoutMS: 12000,
            reconnectInterval: 500
        }
    },

    jwt: {
        secret: '8e98dbc6007c723278fc660ab16bb77fee7eda7ba008d88cb4452f9278363976ab32e83104dc8c4d',
        options: {
            expiresIn: '30d'
        }
    },

    gaCode: ''
};

/**
 * initialize config file
 *
 * @param {Object} cfg
 * @param {string} env
 */
function initialize (cfg, env = 'development') {
    try {
        const configuration = module.require(`./config.${env}`);

        // deeper object assign
        Object.keys(configuration)
            .forEach((key) => {
                if (typeof cfg[key] === 'object'
                    && typeof configuration[key] === 'object') {

                    Object.assign(cfg[key], configuration[key]);
                } else {
                    Object.assign(cfg, { [key]: configuration[key] });
                }
            });
    } catch (e) {
        console.info(`No configuration for ENV: ${env}`); // eslint-disable-line
    }

    return cfg;
}

initialize(config, process.env.NODE_ENV);

module.exports = config;
