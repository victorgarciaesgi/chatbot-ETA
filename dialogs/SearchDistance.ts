import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose } from './Apis';
import { capitalize } from 'lodash';
import { createCard } from './functions';


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
    let response = await Apis.getDistance(params.origin, params.destination, params.transportMode);
    if (response.success) {
      let card = createCard(session, response);
      card.text(`Le trajet fait ${response.data.distance}`)
      let msg = new builder.Message(session).addAttachment(card);
      session.send(msg);
      session.endDialog();
    }
  }

]).triggerAction({
  matches: "SearchDistance"
});


