import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps } from './Apis';
import { capitalize } from 'lodash';
import * as util from 'util';

const transport_mode_verbose = ['Voiture', 'Vélo', 'À pied', "Transports en commun"];

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
    let contentType = 'image/png';
    if (response.success) {
      let msg =  await new builder.Message(session).addAttachment({
          contentUrl: `data:${contentType};base64,${response.data.map}`,
          contentType: contentType,
          name: 'Apercu du trajet', 
      }).text(`Voila! J'ai calculé la distance

Il y a ${response.data.distance.text} entre ${capitalize(params.origin)} et ${capitalize(params.destination)}.

Vous pouvez lancer la navigation Google Maps avec ce lien: [Lancer la navigation](${response.data.url})`);
      session.send(msg);
      session.endDialog();
    }
  }

]).triggerAction({
  matches: "SearchDistance"
});


