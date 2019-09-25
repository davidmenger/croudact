/*
 * @author wingbot.ai
 */
'use strict';

const AWS = require('aws-sdk');
const config = require('../config');

const wrapRoute = require('../lib/wrapRoute');
const { channel } = require('../bot');
const botTokenStorage = require('../lib/botTokenStorage');


const SEND_MESSAGE_LAMBDA_NAME = `${config.prefix}-send`;

const lambda = new AWS.Lambda({
    lambda: '2015-03-31'
});

module.exports.handler = wrapRoute(async (event) => {

    if (event.httpMethod === 'GET') {
        const { queryStringParameters } = event;
        if (queryStringParameters.ref) {
            const location = `/?ref=${encodeURIComponent(queryStringParameters.ref)}`;
            return {
                status: 301,
                headers: { Location: location }
            };
        }
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            body: 'RUNNING'
        };
    }

    const parsedBody = JSON.parse(event.body);
    const { botToken = null, senderId = null } = event.queryStringParameters || {};

    let invokeEvent;
    if (botToken && senderId) {
        const tokenObj = await botTokenStorage.findByToken(botToken);

        if (tokenObj.senderId !== parsedBody.sender.id) {
            return {
                statusCode: 401,
                body: 'Unauthorized'
            };
        }

        invokeEvent = { message: parsedBody, senderId: tokenObj.senderId, pageId: tokenObj.pageId };
    } else {
        await channel.verifyRequest(event.body, event.headers);
        invokeEvent = { parsedBody };
    }
    await lambda.invoke({
        FunctionName: SEND_MESSAGE_LAMBDA_NAME,
        Payload: JSON.stringify(invokeEvent),
        LogType: 'Tail',
        InvocationType: 'Event'
    }).promise();

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'text/plain'
        },
        body: 'OK'
    };
});
