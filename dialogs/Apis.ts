import axios from 'axios';
import * as googleMapsApi from '@google/maps';

export const transport_mode_gmaps = ['driving', 'bicycling', 'walking', 'transit', "covoiturage"];
export const transport_mode_verbose = ['Voiture', 'Vélo', 'À pied', "Transports en commun", "BlaBlaCar"];

const googleMaps = googleMapsApi.createClient({
  key: process.env.GOOGLE_API_KEY,
  language: 'fr-FR',
  Promise: Promise
});

const CITYMAPPER_KEY = process.env.CITYMAPPER_KEY;
const MAPS_STATIC_URL = `https://maps.googleapis.com/maps/api/staticmap?key=${process.env.GOOGLE_API_KEY}`
const MAPS_LINK_URL = `https://www.google.com/maps/dir/?api=1`;
const BLABLACAR_URL = `https://public-api.blablacar.com/api/v2/trips?key=${process.env.BLABLACAR_KEY}&locale=fr_FR`


export namespace Apis {
  export async function getDuration(origin: string, destination: string, mode: string, avoid?: string, departure_time?: string): Promise<ApiResponse> {
    let response = await distanceMatrix(origin, destination, mode, avoid, departure_time);
    if (response.success) {
      let data = await directions(origin, destination, mode);
      return {success: true, data: {duration: response.data.duration, url: data.data.url, map: data.data.map}}
    }
  }

  export async function getDistance(origin: string, destination: string, mode: string, avoid?: string): Promise<ApiResponse> {
    let response = await distanceMatrix(origin, destination, mode, avoid);
    if (response.success) {
      let data = await directions(origin, destination, mode);
      return {success: true, data: {distance: response.data.distance, url: data.data.url, map: data.data.map}}
    }
  }

  export async function getDirections(origin: string, destination: string, mode: string, size?: string, avoid?: string): Promise<ApiResponse> {
    let response = await distanceMatrix(origin, destination, mode, avoid);
    if (response.success) {
      let data = await directions(origin, destination, mode, size);
      return {success: true, data: {distance: response.data.distance, duration: response.data.duration, url: data.data.url, map: data.data.map}}
    }
  }
}

export namespace BlaBlaApi {
  export async function getTrips(origin: string, destination: string): Promise<BlablaResponse> {
    let response = await axios.get(`${BLABLACAR_URL}&fn=${origin}&tn=${destination}`);
    let trips: BlablaTrips[] = response.data.trips.slice(0, 3);
    return {success: true, data: {trips: trips}};
  }
}


// functions

async function distanceMatrix(origin: string, destination: string, mode: string, avoid?: string, departure_time?: string): Promise<ApiResponse> {
  let response = await googleMaps.distanceMatrix({
    origins: origin, 
    destinations: destination, 
    mode: mode,
    avoid: avoid? avoid: undefined,
    departure_time: departure_time? departure_time: undefined,
  }).asPromise();

  let elements = response.json.rows[0].elements[0];
  if (elements.status === "OK" || 200){
    return {success: true, data: elements}
  }
  else {
    return {success: false, message: "Aucun résultat n'a été trouvé"}
  }
}

async function directions(origin: string, destination: string, mode: string, size?, avoid?: string, departure_time?: string, ): Promise<ApiResponse> {
  let response = await googleMaps.directions({
    origin: origin,
    destination: destination, 
    mode: mode,
    avoid: avoid? avoid: undefined,
    departure_time: departure_time? departure_time: undefined,
  }).asPromise();
  let path = response.json.routes[0].overview_polyline.points;
  let map = await getStaticMap(path, size);
  let url = encodeURI(`${MAPS_LINK_URL}&origin=${origin}&destination=${destination}&travelmode=${mode}`)


  if (response.status === "OK" || 200){
    return {success: true, data: {map: map, url: url}}
  }
  else {
    return {success: false, message: "Aucun résultat n'a été trouvé"}
  }
}

async function getStaticMap(path: string, size?) : Promise<any> {
  size = size || "500*350";
  let url = `${MAPS_STATIC_URL}&size=${size}&path=enc%3A${path}`;
  return url;
}


// Types

interface ApiResponse {
  success: boolean,
  data?: {
    distance?: IData,
    duration?: IData,
    map?: string,
    url?: string
  },
  message?: string,
}

interface IData {
  text: string,
  value: number
}

interface BlablaResponse {
  success: boolean,
  data?: {
    trips?: BlablaTrips[]
  },
  message?: string,
}

export interface BlablaTrips {
  links: {
    _self: string,
    _front: string
  },
  departure_date: string,
  departure_place: {
    city_name: string,
    adress: string
  },
  arrival_place: {
    city_name: string,
    address: string,
  },
  price: {
    value: number,
    string_value: string,
  },
  price_with_commission: {
    value: number,
    string_value: string,
  },
  price_without_commission: {
    value: number,
    string_value: string,
  },
  commission: {
    value: number,
    string_value: string
  },
  seats_left: number,
  seats: number,
  duration: {
    value: number,
    unity: string
  },
  distance: {
    value: number,
    unity: string
  },

}
