# # Chatbot ETA

Chatbot donnant des itinénaires et les estimations de temps de trajets.
Affiche les trajets disponibles en blablaCar et le prix (API blablacar)

Fait en Nodejs/Typescript

## Installing

```bash
yarn

# or

npm i
```

## Starting the bot

```bash
npm start
```

Bot will start on [localhost:3887/api/messages](localhost:3887/api/messages)

You need API Keys:

* Google Maps Directions API
* Google Maps Distance Matrix API
* Google Maps Static Map API
* Google Maps Javascript API
* Google Maps Geocode API
* BlaBlaCar API

And also

* LUIS url endpoint (JSON file in root)

## Modifier le bot

```bash
npm run dev
```