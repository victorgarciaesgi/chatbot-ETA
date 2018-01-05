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
const transport_mode_verbose = ['Voiture', 'Vélo', 'À pied', "Transports en commun"];
exports.Itineraire = new builder.Library('Itineraire');
exports.Itineraire.dialog('Itineraire', [
    (session, args, next) => {
        if (!args.loop) {
            let originEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Origin');
            let destinationEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'Destination');
            let transportModeEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'TransportModeV2');
            session.userData.searchParams = {
                origin: originEntity ? originEntity.entity : null,
                destination: destinationEntity ? destinationEntity.entity : null,
                transportMode: transportModeEntity ? transportModeEntity.resolution.values[0] : null
            };
        }
        ;
        if (!session.userData.searchParams.origin) {
            builder.Prompts.text(session, ` D'où voulez vous partir ? `);
        }
        else if (!session.userData.searchParams.destination) {
            builder.Prompts.text(session, ` Où voulez vous aller ? `);
        }
        else if (session.userData.searchParams.transportMode == null) {
            builder.Prompts.choice(session, ` Quel moyen de transport souhaitez vous utiliser ? `, transport_mode_verbose, { listStyle: builder.ListStyle.button });
        }
        else {
            next();
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
            }
            else {
                session.userData.searchParams.destination = results.response;
                asked = true;
            }
        }
        if (session.userData.searchParams.transportMode == null) {
            if (asked) {
                session.replaceDialog('Itineraire', { loop: true });
            }
            else {
                session.userData.searchParams.transportMode = Apis_1.transport_mode_gmaps[results.response.index];
                next();
            }
        }
        next();
    },
    (session) => __awaiter(this, void 0, void 0, function* () {
        let params = session.userData.searchParams;
        session.sendTyping();
        let response = yield Apis_1.Apis.getDuration(params.origin, params.destination, params.transportMode);
        let contentType = 'image/png';
        if (response.success) {
            let msg = yield new builder.Message(session).addAttachment({
                contentUrl: `data:${contentType};base64,${response.data.map}`,
                contentType: contentType,
                name: 'Apercu du trajet',
            }).text(`Voila! J'ai calculé le temps estimé.

Il vous faudra ${response.data.duration.text}.

Vous pouvez lancer la navigation Google Maps avec ce lien: [Lancer la navigation](${response.data.url})`);
            session.send(msg);
            session.endDialog();
        }
    })
]).triggerAction({
    matches: "Itineraire"
});
//# sourceMappingURL=Itinairaire.js.map