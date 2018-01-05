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
const lodash_1 = require("lodash");
function createCard(session, response) {
    return __awaiter(this, void 0, void 0, function* () {
        let params = session.userData.searchParams;
        return yield new builder.HeroCard(session)
            .title(`${lodash_1.capitalize(params.origin)} - ${lodash_1.capitalize(params.destination)}`)
            .subtitle(Apis_1.transport_mode_verbose[Apis_1.transport_mode_gmaps.indexOf(params.transportMode)])
            .images([
            builder.CardImage.create(session, `data:image/png;base64,${response.data.map}`)
        ])
            .buttons([
            builder.CardAction.openUrl(session, response.data.url, 'Lancer la navigation')
        ]);
    });
}
exports.createCard = createCard;
function createCarrousel(session, trips) {
    return __awaiter(this, void 0, void 0, function* () {
        var carrousel = [];
        for (let [index, element] of trips.entries()) {
            let image = yield Apis_1.Apis.getDirections(element.departure_place.city_name, element.arrival_place.city_name, 'driving');
            let trip = yield new builder.HeroCard(session)
                .title(`${element.departure_place.city_name} - ${element.arrival_place.city_name} : ${element.price.string_value}`)
                .subtitle(`Départ le ${formatDate(element.departure_date)}`)
                .text(`Places restantes: ${element.seats_left}`)
                .images([
                builder.CardImage.create(session, `data:image/png;base64,${image.data.map}`)
            ])
                .buttons([
                builder.CardAction.openUrl(session, element.links._front, 'Voir sur le site'),
                builder.CardAction.dialogAction(session, 'buyTrip', `${index}`, 'Réserver une place')
            ]);
            carrousel.push(trip);
        }
        ;
        return carrousel;
    });
}
exports.createCarrousel = createCarrousel;
function createReceiptCard(session, element) {
    return __awaiter(this, void 0, void 0, function* () {
        return new builder.ReceiptCard(session)
            .title('Trajet BlaBlaCar')
            .facts([
            builder.Fact.create(session, `${element.departure_place.city_name} - ${element.arrival_place.city_name}`, 'Voyage'),
            builder.Fact.create(session, 'VISA 5555-****', 'Moyent de paiement')
        ])
            .items([
            builder.ReceiptItem.create(session, element.price_without_commission.string_value, 'Prix du trajet'),
            builder.ReceiptItem.create(session, element.commission.string_value, 'Commission')
        ])
            .total(element.price_with_commission.string_value);
    });
}
exports.createReceiptCard = createReceiptCard;
function formatDate(date) {
    let options = { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
    let result = new Date(date);
    console.log(result);
    return result.toLocaleDateString('fr-FR', options);
}
exports.formatDate = formatDate;
//# sourceMappingURL=functions.js.map