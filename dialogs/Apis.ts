import axios from 'axios';

const DISTANCE_API_KEY: string = process.env.DISTANCE_API_KEY;
const EMBED_API_KEY: string = process.env.EMBED_API_KEY;
const DISTANCE_API_URL: string = "https://maps.googleapis.com/maps/api/distancematrix/json?language=fr-FR&";
const EMBED_API_URL: string = "https://www.google.com/maps/embed/v1/direction?key=YOUR_API_KEY&origin=Oslo+Norway&destination=Telemark+Norway";

export const transport_mode_gmaps = ['driving', 'bicycling', 'walking', 'transit'];

export namespace Apis {
  export async function getDuration(origin: string, destination: string, mode: number): Promise<{ success: boolean, duration?: string, message?: string }> {
    let url = encodeURI(`${DISTANCE_API_URL}origins=${origin}&destinations=${destination}&mode=${transport_mode_gmaps[mode]}&key=${DISTANCE_API_KEY}`);
    console.log(url);
    let response = await axios.get(url);
    if (response.data.status == "OK") {
      let elements = response.data.rows[0].elements[0];
      let duration = elements.duration.text;
      return { success: true, duration: duration }
    }
    else {
      return { success: false, message: "La requête a échoué" }
    }
  }

  export async function getDistance(origin: string, destination: string, mode: number): Promise<{ success: boolean, distance?: string, message?: string }> {
    let url = encodeURI(`${DISTANCE_API_URL}origins=${origin}&destinations=${destination}&mode=${transport_mode_gmaps[mode]}&key=${DISTANCE_API_KEY}`);
    console.log(url);
    let response = await axios.get(url);
    if (response.data.status == "OK") {
      let elements = response.data.rows[0].elements[0];
      let distance = elements.distance.text;
      return { success: true, distance: distance }
    }
    else {
      return { success: false, }
    }
  }
}




interface ApiResponse {
  success: boolean,
  data?: {
    distance?: string,
    duration?: string,
  },
  message?: string,
}