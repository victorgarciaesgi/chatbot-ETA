import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose, BlaBlaApi } from './Apis';
import { capitalize } from 'lodash';
import { createCard, createCarrousel, createReceiptCard} from './functions';



export const Blabla = new builder.Library('Blabla');

Blabla.dialog('Home', [
  async (session, args, next) => {
<<<<<<< HEAD
    session.userData.trips = [];
    let params = args.params;
    let { data } = await BlaBlaApi.getTrips(params.origin, params.destination);
    session.userData.trips = data.trips;
    let carroussel = await createCarrousel(session, data.trips);
    let reply = await new builder.Message(session)
        .text(`J'ai trouvé ces trajets pour vous`)
        .attachmentLayout(builder.AttachmentLayout.carousel)
        .attachments(carroussel);
    session.send(reply);
    session.endDialog();
=======
    try {
      session.userData.trips = [];
      let params = args.params;
      let { data } = await BlaBlaApi.getTrips(params.origin, params.destination);
      session.userData.trips = data.trips;
      let carroussel = await createCarrousel(session, data.trips);
      let reply = new builder.Message(session)
          .text(`J'ai trouvé ces trajets pour vous`)
          .attachmentLayout(builder.AttachmentLayout.carousel)
          .attachments(carroussel);
      session.send(reply);
      session.endDialog();
    } catch (error) {
      console.log(error);
    }
>>>>>>> d64bf736e1daf8ca102e6f51794e6f7827a0eb44
  },

]);

Blabla.dialog('buy', [
  async (session, args, next) => {
    let receipt = await createReceiptCard(session, session.userData.trips[Number(args.data)]);
    let msg = await new builder.Message(session).addAttachment(receipt).text('Voici votre réservation');
    session.send(msg);
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


