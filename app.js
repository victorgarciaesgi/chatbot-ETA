require('dotenv-extended').load();

// Config

const RESTIFY = require("restify");
const axios = require('axios');
const builder = require("botbuilder");
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

var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

// Logic

const transport_mode= ['driving', 'bicycling', 'walking', 'transit'];
const transport_mode_verbose= ['Voiture', 'Vélo', 'À pied', "Transports en commun"];

const DISTANCE_API_KEY = process.env.DISTANCE_API_KEY;
const EMBED_API_KEY = process.env.DISTANCE_API_URL;
const DISTANCE_API_URL = "https://maps.googleapis.com/maps/api/distancematrix/json?language=fr-FR&";
const EMBED_API_URL = "https://www.google.com/maps/embed/v1/direction?key=YOUR_API_KEY&origin=Oslo+Norway&destination=Telemark+Norway";


// Dialogs

bot.dialog('SearchTime', [
  (session, args, next) => {
    if (!args.loop) {
      console.log( args.intent.entities);
      let originEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Origin');
      let destinationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Destination');
      let transportModeEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'TransportModeV2');
      session.userData.searchParams = {
        origin : originEntity?originEntity.entity:null,
        destination : destinationEntity?destinationEntity.entity:null,
        transportMode : transportModeEntity?transportModeEntity.resolution.values[0]:null
      };
    }
    
    if (!session.userData.searchParams.origin) {
      builder.Prompts.text(session,` D'où voulez vous partir ? `);
    }
    else if (!session.userData.searchParams.destination) {
      builder.Prompts.text(session,` Où voulez vous aller ? `);
    }
    else if (!session.userData.searchParams.transportMode) {
      builder.Prompts.choice(session,
      ` Quel moyen de transport souhaitez vous utiliser ? `,
      transport_mode_verbose,
      {listStyle: builder.ListStyle.button});
    }
    else {
      next()
    }
  }, 
  (session, results, next) => {
    console.log("@@" + JSON.stringify(results));
    let asked = false;
    console.log(JSON.stringify(session.userData))
    if (!session.userData.searchParams.origin) {
      session.userData.searchParams.origin = results.response;
      asked = true;
    }
    if (!session.userData.searchParams.destination) {
      if (asked) {
        session.replaceDialog('SearchTime', {loop: true});
      } else{
        session.userData.searchParams.destination = results.response;
        asked = true;
      }
    }
    if (!session.userData.searchParams.transportMode) {
      if (asked) {
        session.replaceDialog('SearchTime', {loop: true});
      } else{
        session.userData.searchParams.transportMode = transport_mode[results.response.index];
        next();
      }
    }

    if (!asked) {
      next();
    }
  }, 
  (session, next) => {
    let url = encodeURI(`${DISTANCE_API_URL}origins=${session.userData.searchParams.origin}&destinations=${session.userData.searchParams.destination}&mode=${transport_mode[session.userData.searchParams.transportMode]}&key=${DISTANCE_API_KEY}`);
    console.log(url);
    axios.get(url).then((response) => {
      if (response.data.status == "OK") {
        let elements = response.data.rows[0].elements[0];
        let distance = elements.distance.text;
        let duration = elements.duration.text;
        let output = `Il vous faudra ${duration}`;
        session.send(output);
        next();
      }
    })
  }
]).triggerAction({
  matches: "SearchTime"
});


bot.dialog('Help', function (session) {
  session.endDialog(`Boujour! Essayez de me poser une question commme: Temps pour aller de Paris a Marseille en vélo `);
}).triggerAction({
  matches: 'Help'
});