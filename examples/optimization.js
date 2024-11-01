const MapSDK = require("./../index.js")
const sdk = new MapSDK({ apiKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb21wYW55bmFtZSI6Ik5hdGlvbmFsIElEIiwiaWQiOiJiYjI0ZmE5YS1hNjRjLTQzNjItOTNkNy00YzQyYjQ0ZmVjNTgiLCJ1c2VybmFtZSI6Ik5JRCJ9.hj7wXXvDBhoUXHoPsSBTEAgEf4WtPgwhbfusQ-N2GH0' });


const locations = [
    { latitude: 8.987685259188599, longitude: 38.764792722654455 },
    { latitude: 8.9879443, longitude: 38.7651287 },
    { latitude: 9.087685259188599, longitude: 38.764792722654455 }
];

sdk.getService().getRouteOptimization(locations)
    .then(response => {
        console.log('Route Optimization Response:', response);
    })
    .catch(error => {
        console.error('Error fetching ROUTE Optimization:', error);
    });
