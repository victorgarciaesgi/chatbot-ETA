import * as builder from 'botbuilder';
import { Apis, transport_mode_gmaps, transport_mode_verbose, BlablaTrips} from './Apis';
import { capitalize } from 'lodash';



export async function createCard(session: builder.Session, response): Promise<builder.HeroCard> {
	let params = session.userData.searchParams;
	return await new builder.HeroCard(session)
		.title(`${capitalize(params.origin)} - ${capitalize(params.destination)}`)
		.subtitle(transport_mode_verbose[transport_mode_gmaps.indexOf(params.transportMode)])
		.images([
			builder.CardImage.create(session, `data:image/png;base64,${response.data.map}`)
		])
		.buttons([
			builder.CardAction.openUrl(session, response.data.url, 'Lancer la navigation')
		]);
}

export async function createCarrousel(session, trips: BlablaTrips[]): Promise<builder.HeroCard[]>{
	var carrousel = [];
	for (let [index, element] of trips.entries()) {
		let image = await Apis.getDirections(element.departure_place.city_name, element.arrival_place.city_name, 'driving');
		let trip = await new builder.HeroCard(session)
			.title(`${element.departure_place.city_name} - ${element.arrival_place.city_name} : ${element.price.string_value}`)
			.subtitle(`Départ le ${formatDate(element.departure_date)}`)
			.text(`Places restantes: ${element.seats_left}`)
			.images([
				builder.CardImage.create(session, `data:image/png;base64,${image.data.map}`)
			])
			.buttons([
				builder.CardAction.openUrl(session, element.links._front, 'Voir sur le site'),
				builder.CardAction.dialogAction(session, 'buyTrip', `${index}`, 'Réserver une place')
			])
		carrousel.push(trip);
	};
	return carrousel;
}


export async function createReceiptCard(session: builder.Session, element: BlablaTrips): Promise<builder.ReceiptCard>{
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
}


export function formatDate(date) {
	let options: Intl.DateTimeFormatOptions = {weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "numeric"}
	let result = new Date(date);
	console.log(result)
	return result.toLocaleDateString('fr-FR', options);

}