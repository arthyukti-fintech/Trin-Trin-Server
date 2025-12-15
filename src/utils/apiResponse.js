function ApiResponse(statusCode = 200, data, message = "success") {
    return { statusCode, data, message }
}
module.exports={ApiResponse}