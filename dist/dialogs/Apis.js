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
const axios_1 = require("axios");
const googleMapsApi = require("@google/maps");
exports.transport_mode_gmaps = ['driving', 'bicycling', 'walking', 'transit', "covoiturage"];
exports.transport_mode_verbose = ['Voiture', 'Vélo', 'À pied', "Transports en commun", "BlaBlaCar"];
const googleMaps = googleMapsApi.createClient({
    key: process.env.GOOGLE_API_KEY,
    language: 'fr-FR',
    Promise: Promise
});
const CITYMAPPER_KEY = process.env.CITYMAPPER_KEY;
const MAPS_STATIC_URL = `https://maps.googleapis.com/maps/api/staticmap?key=${process.env.GOOGLE_API_KEY}`;
const MAPS_LINK_URL = `https://www.google.com/maps/dir/?api=1`;
const BLABLACAR_URL = `https://public-api.blablacar.com/api/v2/trips?key=${process.env.BLABLACAR_KEY}&locale=fr_FR`;
var Apis;
(function (Apis) {
    function getDuration(origin, destination, mode, avoid, departure_time) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield distanceMatrix(origin, destination, mode, avoid, departure_time);
            if (response.success) {
                let data = yield directions(origin, destination, mode);
                return { success: true, data: { duration: response.data.duration, url: data.data.url, map: data.data.map } };
            }
        });
    }
    Apis.getDuration = getDuration;
    function getDistance(origin, destination, mode, avoid) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield distanceMatrix(origin, destination, mode, avoid);
            if (response.success) {
                let data = yield directions(origin, destination, mode);
                return { success: true, data: { distance: response.data.distance, url: data.data.url, map: data.data.map } };
            }
        });
    }
    Apis.getDistance = getDistance;
    function getDirections(origin, destination, mode, size, avoid) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield distanceMatrix(origin, destination, mode, avoid);
            if (response.success) {
                let data = yield directions(origin, destination, mode, size);
                return { success: true, data: { distance: response.data.distance, duration: response.data.duration, url: data.data.url, map: data.data.map } };
            }
        });
    }
    Apis.getDirections = getDirections;
})(Apis = exports.Apis || (exports.Apis = {}));
var BlaBlaApi;
(function (BlaBlaApi) {
    function getTrips(origin, destination) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield axios_1.default.get(`${BLABLACAR_URL}&fn=${origin}&tn=${destination}`);
            let trips = response.data.trips.slice(0, 3);
            return { success: true, data: { trips: trips } };
        });
    }
    BlaBlaApi.getTrips = getTrips;
})(BlaBlaApi = exports.BlaBlaApi || (exports.BlaBlaApi = {}));
// functions
function distanceMatrix(origin, destination, mode, avoid, departure_time) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield googleMaps.distanceMatrix({
            origins: origin,
            destinations: destination,
            mode: mode,
            avoid: avoid ? avoid : undefined,
            departure_time: departure_time ? departure_time : undefined,
        }).asPromise();
        let elements = response.json.rows[0].elements[0];
        if (elements.status === "OK" || 200) {
            return { success: true, data: elements };
        }
        else {
            return { success: false, message: "Aucun résultat n'a été trouvé" };
        }
    });
}
function directions(origin, destination, mode, size, avoid, departure_time) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield googleMaps.directions({
            origin: origin,
            destination: destination,
            mode: mode,
            avoid: avoid ? avoid : undefined,
            departure_time: departure_time ? departure_time : undefined,
        }).asPromise();
        let path = response.json.routes[0].overview_polyline.points;
        let map = yield getStaticMap(path, size);
        let url = encodeURI(`${MAPS_LINK_URL}&origin=${origin}&destination=${destination}&travelmode=${mode}`);
        if (response.status === "OK" || 200) {
            return { success: true, data: { map: map, url: url } };
        }
        else {
            return { success: false, message: "Aucun résultat n'a été trouvé" };
        }
    });
}
function getStaticMap(path, size) {
    return __awaiter(this, void 0, void 0, function* () {
        size = size || "600x400";
        let url = `${MAPS_STATIC_URL}&size=${size}&path=enc%3A${path}`;
        let response = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
        let image = new Buffer(response.data, 'binary').toString('base64');
        return image;
    });
}
//# sourceMappingURL=Apis.js.map