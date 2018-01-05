import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose, BlaBlaApi } from './Apis';
import { capitalize } from 'lodash';
import { createCard, createCarrousel, createReceiptCard} from './functions';



export const Blabla = new builder.Library('Blabla');
var keep_trips = [];

Blabla.dialog('Home', [
  async (session, args, next) => {
    session.sendTyping();
    console.log(args)
    let params = args.params;
    console.log('home')
    let { data } = await BlaBlaApi.getTrips(params.origin, params.destination);
    console.log('trips ok')
    session.sendTyping();
    session.userData.trips = data.trips;
    let carroussel = await createCarrousel(session, data.trips);
    session.sendTyping();
    console.log('carrousel ok')
    let reply = new builder.Message(session)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(carroussel);
    session.send(reply);
  },

]);

Blabla.dialog('buy', [
  (session, args, next) => {
    console.log(args);
    createReceiptCard(session, keep_trips[args.data]);
    builder.Prompts.choice(session, 'Confirmer la réservation?', 'Oui|Non', {listStyle: builder.ListStyle.button})
  },
  (session, results, next) => {
    if (results.response.index == 0) {
      session.send('Votre réservation est effectuée!')
    } else{
      session.send('Réservation annulée')
    }
    session.endDialog();
  },
])


