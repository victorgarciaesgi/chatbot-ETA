import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose, BlablaTrips} from './Apis';
import { capitalize } from 'lodash';
import * as moment from 'moment';

moment.locale('FR');


export function createCard(session: builder.Session, response): builder.HeroCard {
	let params = session.userData.searchParams;
	return new builder.HeroCard(session)
		.title(`${capitalize(params.origin)} - ${capitalize(params.destination)}`)
		.subtitle(transport_mode_verbose[transport_mode_gmaps.indexOf(params.transportMode)])
		.images([
			builder.CardImage.create(session, response.data.map)
		])
		.buttons([
			builder.CardAction.openUrl(session, response.data.url, 'Lancer la navigation')
		]);
}



export async function createCarrousel(session, trips: BlablaTrips[]): Promise<builder.HeroCard[]>{
	var carrousel = [];
	for (let [index, element] of trips.entries()) {
		let image = await Apis.getDirections(element.departure_place.city_name, element.arrival_place.city_name, 'driving');
		let trip = new builder.HeroCard(session)
			.title(`${element.departure_place.city_name} - ${element.arrival_place.city_name} : ${element.price.string_value}`)
			.subtitle(`Départ le ${element.departure_date}`)
			.text(`Places restantes: ${element.seats_left}`)
			.images([
				builder.CardImage.create(session, image.data.map)
			])
			.buttons([
				builder.CardAction.openUrl(session, element.links._front, 'Voir sur le site'),
				builder.CardAction.dialogAction(session, 'buyTrip', `${index}`, 'Réserver la place')
			])
		carrousel.push(trip);
	};
	return carrousel;
}


export function createReceiptCard(session: builder.Session, element: BlablaTrips): builder.ReceiptCard{
	return new builder.ReceiptCard(session)
		.title('Trajet BlaBlaCar')
		.facts([
			builder.Fact.create(session, `${element.departure_place.city_name} - ${element.arrival_place.city_name}`, 'Voyage'),
			builder.Fact.create(session, 'VISA 5555-****', 'Moyent de paiement'),
			builder.Fact.create(session, session.userData.fullName, 'Nom du passager')
		])
		.items([
			builder.ReceiptItem.create(session, element.price_without_commission.string_value, 'Prix du trajet')
				.quantity('1')
				.image(builder.CardImage.create(session,'https://d1ovtcjitiy70m.cloudfront.net/vi-1/images/blablacar-ridesharing-logo.svg')),
			builder.ReceiptItem.create(session, element.commission.string_value, 'Commission')
				.quantity('1')
				.image(builder.CardImage.create(session,'https://d1ovtcjitiy70m.cloudfront.net/vi-1/images/blablacar-ridesharing-logo.svg')),
		])
		.tax('0')
		.vat('0')
		.total(element.price_with_commission.string_value);
}


export function formatDate(date) {
	let options: Intl.DateTimeFormatOptions = {weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "numeric"}
	let result = new Date(date);
	console.log(result)
	return result.toLocaleDateString('fr-FR', options);

}