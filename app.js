require('dotenv-extended').load();

const RESTIFY = require("restify");
const builder = require("botbuilder");
const server = RESTIFY.createServer();
const PORT = process.env.PORT || 3887;

const SearchTime = require('./dialogs/SearchTime.js');

let LUIS_MODEL_URL = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2b52acd0-ddd1-4a8e-945a-bbcc4dd72123?subscription-key=abe662e52d9e4347a55023acb7f33cb4&verbose=true&timezoneOffset=0&q="

server.listen(PORT, () => {
  console.log(`${server.name} bot started on port ${PORT}. Url: ${server.url}`);
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
      session.dialogData.searchParams.originEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Origin');
      session.dialogData.searchParams.destinationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Destination');
      session.dialogData.searchParams.transportModeEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'TransportMode');   
    }
    
    if (!!session.dialogData.searchParams.originEntity) {
      builder.Prompts.text(` D'où voulez vous partir ? `);
      session.replaceDialog('SearchTime', {loop: true});
    }

    if (!!session.dialogData.searchParams.destinationEntity) {
      builder.Prompts.text(` Où voulez vous aller ? `);
      session.replaceDialog('SearchTime', {loop: true});
    }

    if (!!session.dialogData.searchParams.transportModeEntity) {
      builder.Prompts.text(` Comment souhaitez vous y rendre? `);
      session.replaceDialog('SearchTime', {loop: true});
    }
  }, 
  (session, results, next) => {

  }
])