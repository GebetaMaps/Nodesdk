# API Reference

### Get Directions

>`getDirections(origin, destination, waypoints = [], instruction = false)`
Fetches directions between two points with optional waypoints.

#### Returns
`Promise`: A promise that resolves to the directions response

#### Parameters
- `origin` (Object): Origin point with latitude and longitude properties
- `destination` (Object): Destination point with latitude and longitude properties
- `waypoints` (Array\<Object\>, optional): Array of waypoint objects with latitude and longitude properties. Default is an empty array
- `instruction` (boolean, optional): Flag to include instructions in the response. Default is false

#### Example
```javascript
sdk.getService().getDirections(origin, destination, waypoints)
    .then(response => {
        console.log('Directions Response:', response);
    })
    .catch(error => {
        console.error('Error fetching directions:', error);
    });
```

---

### Get Route Matrix
>`getRouteMatrix(locations)`
Fetches a distance matrix for a set of points.

#### Parameters
- `locations` (Array\<Object\>): Array of location points with latitude and longitude properties

#### Returns
`Promise`: A promise that resolves to the matrix response

#### Example
```javascript
sdk.getService().getRouteMatrix(locations)
    .then(response => {
        console.log('Matrix Response:', response);
    })
    .catch(error => {
        console.error('Error fetching matrix:', error);
    });
```

---

### Get Route ONM
>`getRouteONM(origin, locations)`
Fetches one-to-many routing calculations.

#### Parameters
- `origin` (Object): Origin point with latitude and longitude properties
- `locations` (Array\<Object\>): Array of location points with latitude and longitude properties

#### Returns
`Promise`: A promise that resolves to the one-to-many (ONM) response

#### Example
```javascript
sdk.getService().getRouteONM(origin, locations)
    .then(response => {
        console.log('ONM Response:', response);
    })
    .catch(error => {
        console.error('Error fetching ONM:', error);
    });
```

---

### Get Route Optimization
>`getRouteOptimization(locations)`
Fetches route optimization for a set of points.

#### Parameters
- `locations` (Array\<Object\>): Array of location points with latitude and longitude properties

#### Returns
`Promise`: A promise that resolves to the route optimization response

#### Example
```javascript
sdk.getService().getRouteOptimization(locations)
    .then(response => {
        console.log('Optimization Response:', response);
    })
    .catch(error => {
        console.error('Error fetching optimization:', error);
    });
```