import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose } from './Apis';
import { capitalize } from 'lodash';
import { createCard } from './Cards';


export const SearchTime = new builder.Library('SearchTime');

SearchTime.dialog('SearchTime', [
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
        session.replaceDialog('SearchTime', { loop: true });
      } else {
        session.userData.searchParams.destination = results.response;
        asked = true;
      }
    }

    if (session.userData.searchParams.transportMode == null) {
      if (asked) {
        session.replaceDialog('SearchTime', { loop: true });
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
        let response = await Apis.getDuration(params.origin, params.destination, params.transportMode);
        let msg;
        if (response.success) {
          let card = await createCard(session, response);
          card.text(`Il vous faudra ${response.data.duration.text}`)
          msg = await new builder.Message(session).addAttachment(card);
        } else {
          msg = response.message;
        }
        session.send(msg);
      } catch (error) {
        session.send('Erreur dans la requete')
        console.log(error);
      }
      session.endDialog();
    }
  }

]).triggerAction({
  matches: "SearchTime"
});


