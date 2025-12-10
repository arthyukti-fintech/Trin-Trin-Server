const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";

    console.log("global error", err)

    const response = {
        success: false,
        message,
        error: err.errors || [],
        data: null
    }
    return res.status(statusCode).json(response)
}

module.exports = globalErrorHandler