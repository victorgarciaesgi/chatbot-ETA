import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose } from './Apis';
import { capitalize } from 'lodash';
import { createCard } from './Cards';


export const SearchDistance = new builder.Library('SearchDistance');

SearchDistance.dialog('SearchDistance', [
  (session, args, next) => {
    if (!args.loop) {
      let originEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Origin');
      let destinationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Destination');
      let transportModeEntity = <any>builder.EntityRecognizer.findEntity(args.intent.entities, 'TransportModeV2');
      session.userData.searchParams = {
        origin: originEntity ? originEntity.entity : null,
        destination: destinationEntity ? destinationEntity.entity : null,
        transportMode: transportModeEntity ? transportModeEntity.resolution.values[0] : null
      };
    };
    if (!session.userData.searchParams.origin) {
      builder.Prompts.text(session, ` D'où voulez vous partir ? `, );
    }
    else if (!session.userData.searchParams.destination) {
      builder.Prompts.text(session, ` Où voulez vous aller ? `);
    }
    else {
      next()
    }
  },
  (session, results, next) => {
    let asked = false;
    if (!session.userData.searchParams.origin) {
      session.userData.searchParams.origin = results.response;
      asked = true;
    }

    if (!session.userData.searchParams.destination) {
      if (asked) {
        session.replaceDialog('SearchDistance', { loop: true });
      } else {
        session.userData.searchParams.destination = results.response;
        asked = true;
      }
    }

    next();
  },
  async (session) => {
    let params = session.userData.searchParams;
    session.sendTyping();
    if (params.transportMode == 'covoiturage') {
      params.transportMode = "driving";
    }
    let msg;
    let response = await Apis.getDistance(params.origin, params.destination, params.transportMode);
    if (response.success) {
      let card = await createCard(session, response);
      console.log(response.data)
      card.text(`Le trajet fait ${response.data.distance.text}`)
      msg = await new builder.Message(session).addAttachment(card);
      
    } else {
      msg = response.message;
    }
    session.send(msg);
    session.endDialog();
  }

]).triggerAction({
  matches: "SearchDistance"
}).endConversationAction(
  "finConv", "Très bien. Posez moi une autre question!",
    {
      matches: /^cancel$|^exit$|^sortir$|^annuler$/i,
    }
);


