# Map SDK Examples

This document provides practical examples of how to use the Map SDK in different scenarios.
If you want to learn more about the SDK, please refer to the [SDK Documentation](api.md).
## Basic Usage

### Initialize the SDK
```javascript
const MapSDK = require('@gebeta/map-sdk');

const sdk = new MapSDK({ 
    apiKey: 'YOUR_API_KEY',
    timeout: 30000, // Optional: default is 30000ms
    debug: false    // Optional: enable debug logging
});
```

### Get Directions
[see more examples](../examples/directions.js)
```javascript
// Define points
const origin = { 
    latitude: 8.987685259188599, 
    longitude: 38.764792722654455 
};
const destination = { 
    latitude: 9.087685259188599, 
    longitude: 38.764792722654455 
};

// Get directions without waypoints
sdk.getService().getDirections(origin, destination)
    .then(response => {
        console.log('Route found:', response);
    })
    .catch(error => {
        console.error('Error:', error);
    });
```

### Get Directions with Waypoints
```javascript
const origin = { 
    latitude: 8.987685259188599, 
    longitude: 38.764792722654455 
};
const destination = { 
    latitude: 9.087685259188599, 
    longitude: 38.764792722654455 
};
const waypoints = [
    { 
        latitude: 9.050942296370327, 
        longitude: 38.6874317938697 
    }
];

sdk.getService().getDirections(origin, destination, waypoints)
    .then(response => {
        console.log('Route with waypoints:', response);
    })
    .catch(error => {
        console.error('Error:', error);
    });
```

## Advanced Usage

### Calculate Route Matrix
[see more examples](../examples/matrix.js)
```javascript
const locations = [
    { latitude: 8.987685259188599, longitude: 38.764792722654455 },
    { latitude: 9.087685259188599, longitude: 38.764792722654455 },
    { latitude: 9.050942296370327, longitude: 38.6874317938697 }
];

sdk.getService().getRouteMatrix(locations)
    .then(response => {
        console.log('Matrix Response:', response);
    })
    .catch(error => {
        console.error('Error calculating matrix:', error);
    });
```

### One-to-Many Route Calculation
[see more examples](../examples/onm.js)
```javascript
const origin = { 
    latitude: 8.987685259188599, 
    longitude: 38.764792722654455 
};
const destinations = [
    { latitude: 9.087685259188599, longitude: 38.764792722654455 },
    { latitude: 9.050942296370327, longitude: 38.6874317938697 },
    { latitude: 9.065942296370327, longitude: 38.6974317938697 }
];

sdk.getService().getRouteONM(origin, destinations)
    .then(response => {
        console.log('One-to-Many Routes:', response);
    })
    .catch(error => {
        console.error('Error calculating routes:', error);
    });
```

## Error Handling Examples

### Handling Validation Errors
```javascript
const invalidOrigin = { 
    latitude: 'invalid', 
    longitude: 38.764792722654455 
};
const destination = { 
    latitude: 9.087685259188599, 
    longitude: 38.764792722654455 
};

sdk.getService().getDirections(invalidOrigin, destination)
    .then(response => {
        console.log('Route found:', response);
    })
    .catch(error => {
        if (error.name === 'ValidationError') {
            console.error('Invalid coordinates provided:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    });
```

### Handling Authentication Errors
```javascript
const sdk = new MapSDK({ 
    apiKey: 'INVALID_API_KEY'
});

sdk.getService().getDirections(origin, destination)
    .then(response => {
        console.log('Route found:', response);
    })
    .catch(error => {
        if (error.name === 'AuthError') {
            console.error('Authentication failed:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    });
```

## Complete Application Example

```javascript
const MapSDK = require('@gebeta/map-sdk');

class RouteCalculator {
    constructor(apiKey) {
        this.sdk = new MapSDK({ 
            apiKey: apiKey,
            debug: true
        });
    }

    async calculateOptimalRoute(origin, destination, intermediatePoints = []) {
        try {
            // Get basic route first
            const directRoute = await this.sdk.getService().getDirections(
                origin, 
                destination
            );

            // If there are intermediate points, calculate with waypoints
            if (intermediatePoints.length > 0) {
                const routeWithStops = await this.sdk.getService().getDirections(
                    origin,
                    destination,
                    intermediatePoints
                );
                return routeWithStops;
            }

            return directRoute;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    handleError(error) {
        switch(error.name) {
            case 'ValidationError':
                console.error('Invalid input:', error.message);
                break;
            case 'AuthError':
                console.error('Authentication failed:', error.message);
                break;
            case 'NetworkError':
                console.error('Network issue:', error.message);
                break;
            default:
                console.error('Unexpected error:', error);
        }
    }
}

// Usage
const calculator = new RouteCalculator('YOUR_API_KEY');
calculator.calculateOptimalRoute(
    { latitude: 8.987685259188599, longitude: 38.764792722654455 },
    { latitude: 9.087685259188599, longitude: 38.764792722654455 }
)
    .then(route => console.log('Optimal route:', route))
    .catch(error => console.error('Failed to calculate route:', error));
