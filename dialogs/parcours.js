const axios = require('axios');

const builder = require("botbuilder");

const library = new builder.Library('parcours');

const API_KEY = "AIzaSyBmhwuT3aPc5t2h1X1rPK0JzXxa8waqaAE";
const API_URL = "https://maps.googleapis.com/maps/api/distancematrix/json?language=fr-FR&";
const transport_mode= ['driving', 'bicycling', 'walking', 'transit'];
const transport_mode_verbose= ['Voiture', 'Vélo', 'A pied', 'En transport en commun'];

library.dialog('home', [
  (session) => {
    builder.Prompts.choice(session, `Bienvenue sur Chatbot ETA. Que voulez vous faire?`,
      ["Calculer un itinéraire", "Historique"],
      {listStyle: builder.ListStyle.button});
  },
  (session, results, next) => {
    switch(results.response.index){
      case 0: 
        session.beginDialog('eta');
        break;
      case 1:
        session.beginDialog('history');
        break;
      default:
        session.beginDialog('home');
        break;
    }
  },
])

library.dialog('eta', [
  (session) => {
    builder.Prompts.choice(session, `Quel moyen de transport voulez-vous utiliser?`,
    transport_mode_verbose,
      {listStyle: builder.ListStyle.button});
  },
  (session, results, next) => {
    if (results.response.index == 4) {
      session.beginDialog('home');
    } else {
      session.userData.transportMode = results.response.index;
      next();
    }
  },
  (session) => {
    builder.Prompts.text(session, 'Veuillez indiquez votre emplacement de départ (Ville, adresse..)')
  },
  (session, results, next) => {
    session.userData.origin = results.response;
    session.send(`Départ: ${results.response}`);
    next();
  },
  (session) => {
    builder.Prompts.text(session, 'Votre adresse de destination');
  },
  (session, results, next) => {
    session.userData.destination = results.response;
    session.send(`Calcul de l'itinéraire de "${session.userData.origin}" à "${results.response}". Mode: ${transport_mode_verbose[session.userData.transportMode]}`);
    let url = encodeURI(`${API_URL}origins=${session.userData.origin}&destinations=${session.userData.destination}&mode=${transport_mode[session.userData.transportMode]}&key=${API_KEY}`);
    console.log(url);
    axios.get(url).then((response) => {
      console.log(response.data.rows);
      if (response.data.status == "OK") {
        let elements = response.data.rows[0].elements[0];
        let distance = elements.distance.text;
        let duration = elements.duration.text;
        let output = `Le trajet est de ${distance} et durera ${duration}`;
        session.send(output);
        next();
      }
    })
    
  },
])


module.exports = library;