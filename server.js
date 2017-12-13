const RESTIFY = require("restify");
const BOTBUILDER = require("botbuilder");
const SERVER = RESTIFY.createServer();
const PORT = process.env.PORT || 3887;

const API_KEY = "AIzaSyBmhwuT3aPc5t2h1X1rPK0JzXxa8waqaAE";




SERVER.listen(PORT, () => {
  console.log(`${SERVER.name} bot started on port ${PORT}`);
});

const CONNECTOR = new BOTBUILDER.ChatConnector({
  appId: process.env.APP_ID,
  appPassword: process.env.APP_SECRET
});

SERVER.post("/api/messages", CONNECTOR.listen());

var bot = new BOTBUILDER.UniversalBot(CONNECTOR, [
  function(session) {
    return session.beginDialog('parcours:home');
  },
]);

const parcours = require('./dialogs/parcours.js')

bot.library(parcours);
