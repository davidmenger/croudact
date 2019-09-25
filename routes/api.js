/*
 * @author wingbot.ai
 */
'use strict';

const {
    GraphApi, validateBotApi, postBackApi, conversationsApi
} = require('wingbot');
const config = require('../config');
const wrapRoute = require('../lib/wrapRoute');

const updateBot = require('../lib/updateBot');
const stateStorage = require('../lib/stateStorage');
const { botFactory, channel, botSettings } = require('../bot');

const DEFAULT_ACCESS_GROUPS = ['botEditor', 'botAdmin', 'appToken'];
const BOT_UPDATE_GROUPS = ['botEditor', 'botAdmin', 'botUser'];
const POSTBACK_GROUPS = ['appToken'];

const api = new GraphApi([
    postBackApi(channel, POSTBACK_GROUPS),
    conversationsApi(stateStorage, null, null, BOT_UPDATE_GROUPS),
    validateBotApi(botFactory, 'start', 'foobar', BOT_UPDATE_GROUPS),
    updateBot(() => botSettings(), BOT_UPDATE_GROUPS)
], {
    token: config.wingbot.token,
    appToken: config.appToken,
    groups: DEFAULT_ACCESS_GROUPS
});

module.exports.handler = wrapRoute(async (event) => {
    const body = JSON.parse(event.body);
    const response = await api.request(body, event.headers);

    return {
        statusCode: 200,
        body: JSON.stringify(response),
        headers: { 'Content-Type': 'application/json' }
    };
});
