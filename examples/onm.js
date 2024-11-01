const MapSDK = require("./../index.js")
const sdk = new MapSDK({ apiKey: 'api_key' });

// Define the origin and destinations
const origin = { latitude: 8.457685259188599, longitude: 38.764792722654455 };
const destinations = [
    { latitude: 8.987685259188599, longitude: 38.764792722654455 },
    { latitude: 8.9879443, longitude: 38.7651287 },
    { latitude: 9.087685259188599, longitude: 38.764792722654455 }
];

sdk.getService().getRouteONM(origin , destinations)
    .then(response => {
        console.log('Route ONM Response:', response);
    })
    .catch(error => {
        console.error('Error fetching route ONM:', error);
    });

