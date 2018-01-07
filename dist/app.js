"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Config
const RESTIFY = require("restify");
const builder = require("botbuilder");
require('dotenv-extended').load();
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
const bot = new builder.UniversalBot(connector, [(session) => {
        session.send(`Je n'ai pas compris ce que vous avez dit`);
        session.endDialog();
    }]);
const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL).onEnabled(function (context, callback) {
    callback(null, context.dialogStack().length == 0);
});
bot.recognizer(recognizer);
// Dialogs
const SearchTime_1 = require("./dialogs/SearchTime");
const SearchDistance_1 = require("./dialogs/SearchDistance");
const Itineraire_1 = require("./dialogs/Itineraire");
const BlablaCar_1 = require("./dialogs/BlablaCar");
bot.library(SearchTime_1.SearchTime);
bot.library(SearchDistance_1.SearchDistance);
bot.library(Itineraire_1.Itineraire);
bot.library(BlablaCar_1.Blabla);
bot.beginDialogAction('buyTrip', 'Blabla:buy');
bot.use(builder.Middleware.sendTyping());
bot.dialog('Hello', function (session) {
    session.endDialog(`### Bonjour!  
  Bienvenue sur le chatbot ETA. Je peux vous estimer le temps de trajet et la distance d’un point vers un autre ainsi que vous calculer l’itinéraire.  
  

  Essayez de me poser des questions comme :  


  * Itinéraire de Paris à Lyon en vélo
  * Temps de trajet entre Marseille et Bordeaux
  * Emmène moi à Quimper`);
}).triggerAction({
    matches: 'Hello'
});
bot.dialog('Help', function (session) {
    session.endDialog(`Essayez de me poser des questions comme :  


  * Itinéraire de Paris à Lyon en vélo
  * Temps de trajet entre Marseille et Bordeaux
  * Emmène moi à Quimper`);
}).triggerAction({
    matches: 'Help'
});
// import * as googleMapsApi from '@google/maps';
// const googleMaps = googleMapsApi.createClient({
//   key: process.env.GOOGLE_API_KEY,
//   langage: 'fr-FR',
//   Promise: Promise
// });
// googleMaps.distanceMatrix({
//   origins: 'paris',
//   destinations: 'marseille',
//   mode: 'driving',
// }).asPromise().then((response) => {
//   console.log(response.json.rows[0]);
// }) 
//# sourceMappingURL=app.js.map