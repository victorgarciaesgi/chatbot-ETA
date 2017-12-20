// Config
require('dotenv-extended').load();
import * as RESTIFY from "restify";
import * as builder from "botbuilder";
const server = RESTIFY.createServer();
const PORT = process.env.PORT || 3887;

import { SearchTime } from './dialogs/SearchTime';

server.listen(PORT, () => {
  console.log(`${server.name} bot started on port ${PORT}`);
});

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post("/api/messages", connector.listen());

var bot = new builder.UniversalBot(connector, [(session) => {
    session.send(`Je n'ai pas compris ce que vous avez dit`);
}]);

var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

// Logic

const transport_mode = ['driving', 'bicycling', 'walking', 'transit'];
const transport_mode_verbose = ['Voiture', 'Vélo', 'À pied', "Transports en commun"];



// Dialogs

bot.library(SearchTime);




bot.dialog('Help', function (session) {
  session.endDialog(`Boujour! Essayez de me poser une question commme: Temps pour aller de Paris a Marseille en vélo `);
}).triggerAction({
  matches: 'Help'
});