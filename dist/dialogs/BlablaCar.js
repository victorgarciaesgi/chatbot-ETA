"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const builder = require("botbuilder");
const Apis_1 = require("./Apis");
const functions_1 = require("./functions");
exports.Blabla = new builder.Library('Blabla');
exports.Blabla.dialog('Home', [
    (session, args, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            session.userData.trips = [];
            let params = args.params;
            let { data } = yield Apis_1.BlaBlaApi.getTrips(params.origin, params.destination);
            session.userData.trips = data.trips;
            let carroussel = yield functions_1.createCarrousel(session, data.trips);
            let reply = new builder.Message(session)
                .text(`J'ai trouvé ces trajets pour vous`)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments(carroussel);
            session.send(reply);
            session.endDialog();
        }
        catch (error) {
            console.log(error);
        }
    }),
]);
exports.Blabla.dialog('buy', [
    (session, args, next) => __awaiter(this, void 0, void 0, function* () {
        let receipt = yield functions_1.createReceiptCard(session, session.userData.trips[Number(args.data)]);
        let msg = yield new builder.Message(session).addAttachment(receipt).text('Voici votre réservation');
        session.send(msg);
        builder.Prompts.choice(session, 'Confirmer la réservation?', 'Oui|Non', { listStyle: builder.ListStyle.button });
    }),
]);
exports.Blabla.dialog('askName', [
    (session) => {
        builder.Prompts.text(session, 'Veuillez présicer votre nom et prénom');
    }
]);
exports.Blabla.dialog('reserver', [
    (session, results, next) => {
        if (results.response.index == 0) {
            session.send('Votre réservation est effectuée!');
        }
        else {
            session.send('Réservation annulée');
        }
        session.endDialog();
    },
]);
//# sourceMappingURL=BlablaCar.js.map