"use strict";
exports.__esModule = true;
// Config
require('dotenv-extended').load();
var RESTIFY = require("restify");
var builder = require("botbuilder");
var server = RESTIFY.createServer();
var PORT = process.env.PORT || 3887;
var SearchTime_1 = require("./dialogs/SearchTime");
server.listen(PORT, function () {
    console.log(server.name + " bot started on port " + PORT);
});
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post("/api/messages", connector.listen());
var bot = new builder.UniversalBot(connector, [function (session) {
        session.send("Je n'ai pas compris ce que vous avez dit");
    }]);
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);
// Logic
var transport_mode = ['driving', 'bicycling', 'walking', 'transit'];
var transport_mode_verbose = ['Voiture', 'Vélo', 'À pied', "Transports en commun"];
// Dialogs
bot.library(SearchTime_1.SearchTime);
bot.dialog('Help', function (session) {
    session.endDialog("Boujour! Essayez de me poser une question commme: Temps pour aller de Paris a Marseille en v\u00E9lo ");
}).triggerAction({
    matches: 'Help'
});
