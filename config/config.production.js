/*
 * @author wingbot.ai
 */
'use strict';

module.exports = {

    isProduction: true,

    // where the assets or html views are stored
    appUrl: 'https://croudact.flyto.cloud',

    // where the application API lays
    apiUrl: 'https://croudact-api.flyto.cloud',


    wingbot: {
        snapshot: 'production',
        token: 'Ach6JjnHkOdSZ5wtu5QK29EgfLnZjTGihiMS15l1yE2xlLRrEmo5yuOpG5LHAd6kq7CuqLSZ3FDk93bLpBR2h7QqfYuZMNy0BY9VaoSQenhDwFCAWPC4msMWvhh88GAV',
        ai: 'croudact-production'
    },

    // token for accessing a chatbot API
    appToken: 'a2916d963da30aefaaf885c5741e16ea54cce8309b69a0d6178d5638044850cfcd8198c2829bf902c14e4f020f23f61f3d72f4bb5ecd5311809e2c2dd61cf21906172f1090b7183594ff8962bb0ae0f8',

    botService: {
        appId: process.env.BOT_APP_ID || 'b73e9255-5cec-43b3-b4af-4f509ac865ef',
        appSecret: process.env.BOT_APP_PASSWORD || 'tOAzdw0[tmfiHFifwtmMi0ayG61c=V+_'
    },

    db: {
        db: 'croudact',
        url: 'mongodb+srv://croudact:croudact@croudact-pkr9i.mongodb.net/croudact?retryWrites=true&w=majority'
    },

    gaCode: ''

};
