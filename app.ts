// Config
import * as RESTIFY from "restify";
import * as builder from "botbuilder";
import axios from 'axios';
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

const possibilities = `* Itinéraire de Paris à Lyon en vélo
* Temps de trajet entre le 9 avenue Fosh 94340 et Bordeaux
* Emmène moi à Quimper en covoiturage
* Distance entre Paris et Toulouse
* Je veux aller à Nantes`

const bot = new builder.UniversalBot(connector, [(session) => {
    session.send(`Je n'ai pas compris ce que vous avez dit
    
### Essayez de me poser des questions comme : 

${possibilities}`);
    session.endDialog();
}]);

const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL).onEnabled(function (context, callback) {
  callback(null, context.dialogStack().length == 0);
});
bot.recognizer(recognizer);

// Dialogs

import { SearchTime } from './dialogs/SearchTime';
import { SearchDistance } from './dialogs/SearchDistance';
import { Itineraire } from './dialogs/Itineraire';
import { Blabla } from './dialogs/BlablaCar';

bot.library(SearchTime);
bot.library(SearchDistance);
bot.library(Itineraire);
bot.library(Blabla);

bot.beginDialogAction('buyTrip', 'Blabla:buy');
bot.use(builder.Middleware.sendTyping())

bot.dialog('Hello', function (session) {
  session.endDialog(`## Bonjour!  
Bienvenue sur le chatbot ETA. 
Je peux vous estimer le temps de trajet et la distance d’un point vers un autre ainsi que vous calculer l’itinéraire.  
Je peux également rechercher et réserver des trajets BlaBlaCar
  
---

### Essayez de me poser des questions comme:

${possibilities}`);
}).triggerAction({
  matches: 'Hello'
});

bot.dialog('Help', function (session) {
  session.endDialog(`Essayez de me poser des questions comme :  
${possibilities}`);
}).triggerAction({
  matches: 'Help'
})


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