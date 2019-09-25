/*
 * @author wingbot.ai
 */
'use strict';

const { ObjectID } = require('mongodb');
const { Plugins, Request } = require('wingbot');
const request = require('request-promise-native');
const mongodb = require('../../lib/mongodb');

const PAYMENT_SENT = 'expense/payment-received';
const BUY_REQUEST_CREATED = 'expense/request-approval-new-donation';
const BUY_REQUEST_APPROVED = 'expense/approval-success';

const plugins = new Plugins();

// register plugins here, but its good to keep them in separate files
//
plugins.register('loadPlace', async (req, res) => {
    const { id } = Object.assign({}, req.state, res.newState);

    if (!id) {
        res.text('no id');
        return null;
    }

    const db = await mongodb();
    const c = db.collection('places');

    const place = await c.findOne({
        _id: new ObjectID(id)
    });

    if (place) {
        delete place._id;
        res.setState(place);

        if (place.creator.senderId === req.senderId) {
            await res.run('yourplace');
            return null;
        }
    }
    return undefined;
});

plugins.register('createPlace', async (req) => {

    const db = await mongodb();
    const c = db.collection('places');

    const {
        lat,
        lon,
        name,
        placeTypeText,
        placeType,
        goal
    } = req.state;
    const { senderId, pageId } = req;

    await c.insertOne({
        lat,
        lon,
        name,
        placeTypeText,
        placeType,
        goal,
        credit: 0,
        creator: { senderId, pageId },
        contributors: []
    });

});

plugins.register('loadUser', async (req, res) => {
    const { refresh } = Object.assign({}, req.state, res.newState);

    res.typingOn();
    if (!refresh) {
        return;
    }

    const autores = await request({
        url: 'https://webapi.developers.erstegroup.com/api/csas/sandbox/v1/sandbox-idp/token',
        method: 'POST',
        json: true,
        form: {
            grant_type: 'refresh_token',
            client_secret: 'af1a010b-2a96-43e8-8b64-1384190993d3',
            refresh_token: refresh,
            client_id: 'c1ea98f3-9920-4531-ae58-02848694cfe1',
            access_type: 'offline'
        }
    });

    const { access_token: token } = autores;

    const data = await request({
        url: 'https://webapi.developers.erstegroup.com/api/csas/public/sandbox/v1/accounts/my/accounts',
        headers: {
            Authorization: `Bearer ${token}`,
            'WEB-API-key': '08157ce1-b436-4dba-80a8-909363274699'
        },
        json: true
    });

    const [{ description }] = data.accounts;

    res.setState({ description });
});

plugins.register('sendMoney', async (req, res) => {
    const { id } = req.state;
    let { amount } = req.params;
    res.typingOn();

    if (!amount) {
        ({ amount } = req.state);
    }

    if (!id) {
        res.text('no id');
        return;
    }

    const db = await mongodb();
    const c = db.collection('places');

    let place = await c.findOneAndUpdate({
        _id: new ObjectID(id)
    }, {
        $push: {
            contributors: {
                senderId: req.senderId,
                pageId: req.pageId
            }
        },
        $inc: { credit: amount }
    });

    if (!place) {
        res.text('no place');
        return;
    }

    place = place.value;

    const { senderId, pageId } = place.creator;

    // eslint-disable-next-line global-require
    const { channel } = require('../../bot');

    const paymentSent = Request.postBack(senderId, PAYMENT_SENT, { amount, id });
    await channel.processMessage(paymentSent, senderId, pageId);
});

plugins.register('createRequest', async (req, res) => {
    const { id, requestText } = req.state;
    res.typingOn();

    if (!id) {
        res.text('no id');
        return;
    }

    const db = await mongodb();
    const c = db.collection('places');

    const placeData = await c.findOneAndUpdate({
        _id: new ObjectID(id)
    }, {
        $set: {
            contributors: [],
            credit: 0
        }
    }, {
        returnOriginal: true
    });

    if (!placeData.value) {
        res.text('no place');
        return;
    }

    const place = placeData.value;

    const to = new Set(place.contributors
        .map(co => co.senderId));

    // eslint-disable-next-line global-require
    const { channel } = require('../../bot');

    await Promise.all(Array.from(to.values())
        .map(senderId => channel
            .processMessage(
                Request
                    .postBack(senderId, BUY_REQUEST_CREATED, { requestText, id }),
                senderId,
                req.pageId
            )));
});

plugins.register('approveRequest', async (req, res) => {
    const { id, requestText } = req.state;
    res.typingOn();

    if (!id) {
        res.text('no id');
        return;
    }

    const db = await mongodb();
    const c = db.collection('places');

    const place = await c.findOne({
        _id: new ObjectID(id)
    });

    if (!place) {
        res.text('no place');
        return;
    }

    const { senderId, pageId } = place.creator;

    // eslint-disable-next-line global-require
    const { channel } = require('../../bot');

    const act = Request.postBack(senderId, BUY_REQUEST_APPROVED, { requestText, id });
    await channel.processMessage(act, senderId, pageId);
});

module.exports = plugins;
