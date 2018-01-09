import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose } from './Apis';
import { capitalize } from 'lodash';
import {createCard} from './Cards';

export const Itineraire = new builder.Library('Itineraire');

Itineraire.dialog('Itineraire', [
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
    else if (session.userData.searchParams.transportMode == null) {
      builder.Prompts.choice(session,
        ` Quel moyen de transport souhaitez vous utiliser ? `,
        transport_mode_verbose,
        { listStyle: builder.ListStyle.button });
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
        session.replaceDialog('Itineraire', { loop: true });
      } else {
        session.userData.searchParams.destination = results.response;
        asked = true;
      }
    }

    if (session.userData.searchParams.transportMode == null) {
      if (asked) {
        session.replaceDialog('Itineraire', { loop: true });
      } else {
        session.userData.searchParams.transportMode = transport_mode_gmaps[results.response.index];
      }
    }
    next();
  },
  async (session) => {
    let params = session.userData.searchParams;
    session.sendTyping();
    if (params.transportMode === "covoiturage") {
      session.beginDialog('Blabla:Home', {params: params})
    } 
    else {
     try {
      let response = await Apis.getDirections(params.origin, params.destination, params.transportMode);
      if (response.success) {
        let card = await createCard(session, response);
        card.text(`Voici l'itineraire. Le trajet fait ${response.data.distance.text} et durera ${response.data.duration.text}`)
        let msg = await new builder.Message(session).addAttachment(card);
        session.send(msg);
        session.endDialog();
      }
     } catch (error) {
       console.log(error)
     }
    }
  }

]).triggerAction({
  matches: "Itineraire"
});


