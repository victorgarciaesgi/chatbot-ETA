import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose, BlaBlaApi } from './Apis';
import { capitalize } from 'lodash';
import { createCard, createCarrousel, createReceiptCard} from './Cards';



export const Blabla = new builder.Library('Blabla');

Blabla.dialog('Home', [
  async (session, args, next) => {
    try {
      session.userData.trips = [];
      session.userData.selectedTrip = null;
      let params = args.params;
      let response = await BlaBlaApi.getTrips(params.origin, params.destination);
      let reply;
      if (response.success) {
        session.userData.trips = response.data.trips;
        let carroussel = await createCarrousel(session, response.data.trips);
        reply = new builder.Message(session)
            .text(`J'ai trouvé ces trajets pour vous`)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(carroussel);
      } else {
        reply = response.message;
      }
      session.send(reply);
      session.endDialog();
    } catch (error) {
      console.log(error);
    }
  },

]);

Blabla.dialog('buy', [
  (session, args, next) => {
    session.userData.selectedTrip = args.data;
    if (!session.userData.fullName) {
      session.beginDialog('askName');
    }
    else {
      session.beginDialog('reserver');
    }
  },
])


Blabla.dialog('askName', [
  (session, args, next) => {
    builder.Prompts.text(session,'Veuillez présicer votre nom et prénom');
  },
  (session, results) => {
    session.userData.fullName = results.response;
    session.beginDialog('reserver', results)
  }
]).endConversationAction(
  "finConv", "Très bien. J'annule la commande",
    {
      matches: /^cancel$|^exit$|^sortir$|^annuler$/i,
    }
);

Blabla.dialog('reserver', [
  async (session, args, next) => {
    let receipt = await createReceiptCard(session, session.userData.trips[Number(session.userData.selectedTrip)]);
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
]).endConversationAction(
  "finConv", "Très bien. J'annule la commande",
    {
      matches: /^cancel$|^exit$|^sortir$|^annuler$/i,
      confirmPrompt: "Cela va annuler votre commande, êtes vous sur?"
    }
);


