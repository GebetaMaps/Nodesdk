const MapSDK = require("./../index.js")
const sdk = new MapSDK({ apiKey: 'api_key' });

// Define the origin and destination points
const origin = { latitude: 8.987685259188599, longitude: 38.764792722654455 };
const destination = { latitude: 9.087685259188599, longitude: 38.764792722654455 };

// Optional: Define any waypoints if needed
const waypoints = [
     { latitude: 9.050942296370327, longitude: 38.6874317938697 }
];

// Call the getDirections method
sdk.getService().getDirections(origin, destination, waypoints)
    .then(response => {
        console.log('Directions Response:', response);
    })
    .catch(error => {
        console.error('Error fetching directions:', error);
});