const BOTBUILDER = require("botbuilder");

const library = new BOTBUILDER.Library('parcours');

library.dialog('home', [
  function (session) {
    BOTBUILDER.Prompts.choice(session, `Que voulez vous faire?`,
  "Créer une alarme|Liste de mes alarmes|Alarmes en cours|Alarmes finies", {listStyle: BOTBUILDER.ListStyle.button});
  },
  function (session, results, next) {
    console.log(results.response.entity);
    switch(results.response.entity){
      case "Créer une alarme" :
        return session.beginDialog('createAlarm');
        break;
      case "Liste de mes alarmes":
        return session.beginDialog('infoAlarm');
        break;
      case "Alarmes en cours":
        var alarms = session.userData.alarms;
        var today = new Date(date.now());
        session.send(`Liste des alarmes finies: <br> 
        ${alarms.filter(alarm => alarm.time > today)
                .map(alarm => `- ${alarm.name} : ${new Date(alarm.time).toLocaleTimeString()} <br>`) }`)
        next();
        break;
      case "Alarmes finies":
        var alarms = session.userData.alarms;
        var today = new Date(date.now());
        session.send(`Liste des alarmes finies: <br> 
        ${alarms.filter(alarm => alarm.time <= today)
                .map(alarm => `- ${alarm.name} : ${new Date(alarm.time).toLocaleTimeString()} <br>`) }`)
        next();
        break;
    }
  },
  function (session, results){
    session.beginDialog('home');
  }
  
])


module.exports = library;