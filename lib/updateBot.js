/*
 * @author wingbot.ai
 */
'use strict';

const AWS = require('aws-sdk');
const { apiAuthorizer } = require('wingbot');
const config = require('../config');

const SEND_MESSAGE_LAMBDA_NAME = `${config.prefix}-send`;

const lambda = new AWS.Lambda();

function getLambda (lambdaName) {
    return new Promise((resolve, reject) => {
        lambda.getFunctionConfiguration({
            FunctionName: lambdaName
        }, (err, res) => {
            if (!err) {
                resolve(res);
            } else {
                reject(err);
            }
        });
    });
}

function updateLambda (lambdaName, env) {
    return new Promise((resolve, reject) => {
        lambda.updateFunctionConfiguration({
            FunctionName: lambdaName,
            Environment: env
        }, (err, res) => {
            if (!err) {
                resolve(res);
            } else {
                reject(err);
            }
        });
    });
}

module.exports = function updateBot (onReady, acl) {
    return {
        async updateBot (args, ctx) {
            if (!apiAuthorizer(args, ctx, acl)) {
                return null;
            }
            const fn = await getLambda(SEND_MESSAGE_LAMBDA_NAME);

            const newEnv = Object.assign({}, fn.Environment, {
                Variables: Object.assign({}, fn.Environment.Variables, {
                    WINGBOT_DEPLOYED_AT: Date.now().toString()
                })
            });

            await updateLambda(SEND_MESSAGE_LAMBDA_NAME, newEnv);

            await onReady();

            return true;
        }
    };
};
