class MapSDKError extends Error {
    constructor(code, message, status, details) {
        super(message);
        this.name = 'MapSDKError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

class ValidationError extends MapSDKError {
    constructor(message, details) {
        super('VALIDATION_ERROR', message, 400, details);
        this.name = 'ValidationError';
    }
}

class NetworkError extends MapSDKError {
    constructor(message, details) {
        super('NETWORK_ERROR', message, 500, details);
        this.name = 'NetworkError';
    }
}

class AuthError extends MapSDKError {
    constructor(message, details) {
        super('AUTH_ERROR', message, 401, details);
        this.name = 'AuthError';
    }
}

module.exports = {
    MapSDKError,
    ValidationError,
    NetworkError,
    AuthError
};