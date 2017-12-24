// Config
require('dotenv-extended').load();
import * as RESTIFY from "restify";
import * as builder from "botbuilder";
import * as globalTunnel from "global-tunnel";
const server = RESTIFY.createServer();
const PORT = process.env.PORT || 3887;

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

var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL).onEnabled(function (context, callback) {
  let enabled = context.dialogStack().length == 0;
  callback(null, enabled);
});
bot.recognizer(recognizer);


// Dialogs

import { SearchTime } from './dialogs/SearchTime';
import { SearchDistance } from './dialogs/SearchDistance';




bot.library(SearchTime);
bot.library(SearchDistance);

bot.dialog('Help', function (session) {
  session.endDialog(`Boujour! Essayez de me poser une question commme: Temps pour aller de Paris a Marseille en vélo `);
}).triggerAction({
  matches: 'Help'
});