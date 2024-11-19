# Map SDK API Documentation

## Introduction
The Map SDK provides a set of APIs to interact with mapping and routing services. It allows you to fetch directions, distance matrices, route optimizations, and perform one-to-many routing calculations.

## Installation
To install the Map SDK, use the following command:
```bash
yarn add @gebeta/map-sdk
```

## Usage
To use the Map SDK, you need to create an instance of the MapSDK class with your API key:

```javascript
const MapSDK = require('@gebeta/map-sdk');
const sdk = new MapSDK({ 
    apiKey: 'YOUR_API_KEY',
    timeout: 30000, // Optional: default is 30000ms
    debug: false    // Optional: enable debug logging
});
```

## Configuration Options
- `apiKey` (string, required): Your API authentication key
- `timeout` (number, optional): Request timeout in milliseconds. Default: 30000
- `debug` (boolean, optional): Enable debug logging. Default: false
- `headers` (Object, optional): Additional headers to include in requests


## Error Handling
The Map SDK throws specific error classes for different types of errors:

- `ValidationError`: Thrown when there is a validation error in the input parameters
- `AuthError`: Thrown when there is an authentication error (401) or access is forbidden (403)
- `MapSDKError`: Thrown for general API errors, including rate limit exceeded errors (429)
- `NetworkError`: Thrown when there is a network error or no response is received


## Constants
The SDK uses the following default constants:
```javascript
const constants = {
    DEFAULT_TIMEOUT: 30000,
    SDK_VERSION: '1.0.0',
    BASE_URL: 'https://mapapi.gebeta.app'
};
```

## API Reference
The Map SDK provides the following APIs:
- Directions
- Route Matrix
- Route ONM
- Route Optimization

[see documentation](api.md) in more detail

## Contributing
Contributions to the Map SDK are welcome! Please submit pull requests or open issues on our GitHub repository.

## License
The Map SDK is licensed under the MIT License.