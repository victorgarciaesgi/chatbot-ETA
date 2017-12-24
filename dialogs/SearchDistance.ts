import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps } from './Apis';
import { capitalize } from 'lodash';

const transport_mode_verbose = ['Voiture', 'Vélo', 'À pied', "Transports en commun"];

export const SearchDistance = new builder.Library('SearchDistance');

SearchDistance.dialog('SearchDistance', [
  (session, args, next) => {
    if (!args.loop) {
      let originEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Origin');
      let destinationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Destination');
      let transportModeEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'TransportModeV2');
      session.userData.searchParams = {
        origin: originEntity ? originEntity.entity : null,
        destination: destinationEntity ? destinationEntity.entity : null,
        transportMode: transportModeEntity ? transport_mode_gmaps.indexOf(transportModeEntity.resolution.values[0]) : null
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
    console.log("@@" + JSON.stringify(results));
    let asked = false;
    console.log(JSON.stringify(session.userData.searchParams))
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

    if (session.userData.searchParams.transportMode == null) {
      if (asked) {
        session.replaceDialog('SearchDistance', { loop: true });
      } else {
        session.userData.searchParams.transportMode = transport_mode_gmaps[results.response.index];
        next();
      }
    }
    next();
  },
  async (session) => {
    let params = session.userData.searchParams;
    // session.send(`Recherche du temps estimé pour aller de ${capitalize(params.origin)} à ${capitalize(params.destination)} (${transport_mode_verbose[params.transportMode]})`);

    let response = await Apis.getDuration(params.origin, params.destination, params.transportMode);
    if (response.success) {
      let output = `Il vous faudra ${response.duration}`;
      session.send(output);
    }
    session.endDialog();
  }

]).triggerAction({
  matches: "SearchDistance"
});


