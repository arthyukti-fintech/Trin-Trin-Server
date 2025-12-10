class ApiError extends Error {
    constructor(message, statusCode = 500, error = []) {
        super(message);
        this.statusCode = statusCode;
        this.message = message
        this.error = error;
        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = { ApiError }