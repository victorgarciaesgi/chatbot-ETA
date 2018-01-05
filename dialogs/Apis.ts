import axios from 'axios';
import * as googleMapsApi from '@google/maps';

export const transport_mode_gmaps = ['driving', 'bicycling', 'walking', 'transit'];

const googleMaps = googleMapsApi.createClient({
  key: process.env.GOOGLE_API_KEY,
  language: 'fr-FR',
  Promise: Promise
});

const CITYMAPPER_KEY = process.env.CITYMAPPER_KEY;
const MAPS_STATIC_URL = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&key=${process.env.GOOGLE_API_KEY}`
const MAPS_LINK_URL = `https://www.google.com/maps/dir/?api=1`


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

  export async function getDirections(origin: string, destination: string, mode: string, avoid?: string): Promise<ApiResponse> {
    let data = await directions(origin, destination, mode, avoid);
    if (data.success) {
      return {success: true, data: {url: data.data.url, map: data.data.map}}
    }
  }
}


// functions

async function distanceMatrix(origin: string, destination: string, mode: string, avoid?: string, departure_time?: string): Promise<ApiResponse> {
  console.log(mode)
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

async function directions(origin: string, destination: string, mode: string, avoid?: string, departure_time?: string): Promise<ApiResponse> {
  let response = await googleMaps.directions({
    origin: origin,
    destination: destination, 
    mode: mode,
    avoid: avoid? avoid: undefined,
    departure_time: departure_time? departure_time: undefined,
  }).asPromise();

  console.log(response.json);
  let path = response.json.routes[0].overview_polyline.points;
  let map = await getStaticMap(path);
  let url = encodeURI(`${MAPS_LINK_URL}&origin=${origin}&destination=${destination}&travelmode=${mode}`)


  if (response.status === "OK" || 200){
    return {success: true, data: {map: map, url: url}}
  }
  else {
    return {success: false, message: "Aucun résultat n'a été trouvé"}
  }
}

async function getStaticMap(path: string) : Promise<any> {
  let url = `${MAPS_STATIC_URL}&path=enc%3A${path}`;
  let response = await axios.get(url,{responseType: 'arraybuffer'});
  let image = new Buffer(response.data, 'binary').toString('base64');
  return image;
}

async function getMapUrl(path: string) {

}






// export namespace Apis {
//   export async function getDuration(origin: string, destination: string, mode: number): Promise<{ success: boolean, duration?: string, message?: string }> {
    
//     let url = encodeURI(`${DISTANCE_API_URL}origins=${origin}&destinations=${destination}&mode=${transport_mode_gmaps[mode]}&key=${DISTANCE_API_KEY}`);
//     console.log(url);
//     let response = await axios.get(url);
//     if (response.data.status == "OK") {
//       let elements = response.data.rows[0].elements[0];
//       let duration = elements.duration.text;
//       return { success: true, duration: duration }
//     }
//     else {
//       return { success: false, message: "La requête a échoué" }
//     }
//   }

//   export async function getDistance(origin: string, destination: string, mode: number): Promise<{ success: boolean, distance?: string, message?: string }> {
//     let url = encodeURI(`${DISTANCE_API_URL}origins=${origin}&destinations=${destination}&mode=${transport_mode_gmaps[mode]}&key=${DISTANCE_API_KEY}`);
//     console.log(url);
//     let response = await axios.get(url);
//     if (response.data.status == "OK") {
//       let elements = response.data.rows[0].elements[0];
//       let distance = elements.distance.text;
//       return { success: true, distance: distance }
//     }
//     else {
//       return { success: false, }
//     }
//   }
// }




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
