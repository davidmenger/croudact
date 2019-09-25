/**
 * @author wingbot.ai
 */
'use strict';


/**
 * Trigged, when messaging event arrives to be able to record it
 *
 * @param {string} senderId
 * @param {string} action
 * @param {string} text
 * @param {Request} req
 * @param {string} prevAction
 */
function onEvent (senderId, action, text, req, prevAction) { // eslint-disable-line no-unused-vars
}


/**
 * Trigged, when action is executed to be able to record it
 *
 * @param {string} senderId
 * @param {string} action
 * @param {string} text
 * @param {Request} req
 * @param {string} prevAction

 */
function onAction (senderId, action, text, req, prevAction) { // eslint-disable-line no-unused-vars
}

module.exports = { onAction, onEvent };
