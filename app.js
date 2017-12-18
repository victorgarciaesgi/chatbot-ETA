require('dotenv-extended').load();

const RESTIFY = require("restify");
const builder = require("botbuilder");
const server = RESTIFY.createServer();
const PORT = process.env.PORT || 3887;

const SearchTime = require('./dialogs/SearchTime.js');

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

bot.dialog('SearchTime', [
  (session, args, next) => {
    if (!args.loop) {
      console.log(args.intent.entities);
      session.dialogData.searchParams.originEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Origin');
      session.dialogData.searchParams.destinationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Destination');
      session.dialogData.searchParams.transportModeEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'TransportModeV2');  
    }
    
    if (!!session.dialogData.searchParams.originEntity) {
      builder.Prompts.text(session, ` D'où voulez vous partir ? `);
    }

    if (!!session.dialogData.searchParams.destinationEntity) {
      builder.Prompts.text(session, ` Où voulez vous aller ? `);
    }

    if (!!session.dialogData.searchParams.transportModeEntity) {
      builder.Prompts.text(session, ` Comment souhaitez vous y rendre? `);
    }
  }, 
  (session, results, next) => {
    
  }
]).triggerAction({
  matches: "SearchTime"
});


bot.dialog('Help', function (session) {
  session.endDialog(`Boujour! Essayez de me poser une question commme: Temps pour aller de Paris a Marseille en vélo `);
}).triggerAction({
  matches: 'Help'
});