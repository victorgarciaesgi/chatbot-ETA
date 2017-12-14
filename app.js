const RESTIFY = require("restify");
const BOTBUILDER = require("botbuilder");
const SERVER = RESTIFY.createServer();
const PORT = process.env.PORT || 3887;



SERVER.listen(PORT, () => {
  console.log(`${SERVER.name} bot started on port ${PORT}`);
});

const CONNECTOR = new BOTBUILDER.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

SERVER.post("/api/messages", CONNECTOR.listen());

var bot = new BOTBUILDER.UniversalBot(CONNECTOR, [
  function(session) {
    return session.beginDialog('parcours:home');
  },
]);

const parcours = require('./dialogs/parcours.js')

bot.library(parcours);
