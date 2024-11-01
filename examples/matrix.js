const MapSDK = require("./../index.js")
const sdk = new MapSDK({ apiKey: 'api_key' });


const locations = [
    { latitude: 8.987685259188599, longitude: 38.764792722654455 },
    { latitude: 8.9879443, longitude: 38.7651287 },
    { latitude: 9.087685259188599, longitude: 38.764792722654455 }
];

sdk.getService().getRouteMatrix(locations)
    .then(response => {
        console.log('Route Matrix Response:', response);
    })
    .catch(error => {
        console.error('Error fetching route matrix:', error);
    });
