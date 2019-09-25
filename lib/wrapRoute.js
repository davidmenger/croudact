/*
 * @author wingbot.ai
 */
'use strict';
const log = require('./log');
const config = require('../config');

function wrapRoute (fn) {

    return async (event, context) => {
        // eslint-disable-next-line no-param-reassign
        context.callbackWaitsForEmptyEventLoop = false;
        try {
            const res = await Promise.resolve(fn(event, context));

            let { headers = {} } = res;

            headers = {
                ...headers,
                'Access-Control-Allow-Origin': config.cors,
                'Access-Control-Allow-Credentials': 'true'
            };

            return { ...res, headers };
        } catch (e) {
            log.error(e, event);
            return {
                statusCode: e.status || 500,
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': config.cors,
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: e.message
            };
        }
    };
}

module.exports = wrapRoute;
