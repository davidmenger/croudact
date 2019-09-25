/*
 * @author wingbot.ai
 */
'use strict';


const wrapRoute = require('../lib/wrapRoute');
const mongodb = require('../lib/mongodb');


module.exports.list = wrapRoute(async () => {

    const db = await mongodb();
    const c = db.collection('places');

    const data = await c.find({})
        .toArray();

    return {
        statusCode: 200,
        body: JSON.stringify({
            data: data.map(d => ({ ...d, id: d._id.toString() }))
        }),
        headers: { 'Content-Type': 'application/json' }
    };
});
