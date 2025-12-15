const asyncHandler = (requestURL) => {
    return (req, res, next) => {
        Promise.resolve(requestURL(req, res, next)).catch((error) => {
            next(error)
        })
    }
}
module.exports = { asyncHandler }