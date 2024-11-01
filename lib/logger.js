class Logger {
    constructor(options = {}) {
        this.debugMode = options.debug || false;
    }

    info(message, meta = {}) {
        if (this.debugMode) {
            console.log(JSON.stringify({
                level: 'info',
                message,
                timestamp: new Date().toISOString(),
                ...meta
            }));
        }
    }

    error(message, meta = {}) {
        console.error(JSON.stringify({
            level: 'error',
            message,
            timestamp: new Date().toISOString(),
            ...meta
        }));
    }

    debug(message, meta = {}) {
        if (this.debugMode) {
            console.debug(JSON.stringify({
                level: 'debug',
                message,
                timestamp: new Date().toISOString(),
                ...meta
            }));
        }
    }
}

module.exports = Logger;