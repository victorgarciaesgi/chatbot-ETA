import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose, BlaBlaApi } from './Apis';
import { capitalize } from 'lodash';
import { createCard, createCarrousel, createReceiptCard} from './Cards';



export const Fastest = new builder.Library('Fastest');

Fastest.dialog('Home', [
  async (session, args, next) => {
    try {
      
      
      session.send('');
      session.endDialog();
    } catch (error) {
      console.log(error);
    }
  },

]);



