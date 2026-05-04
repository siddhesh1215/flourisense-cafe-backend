const jwt = require("jsonwebtoken");
const config = require("./../config/config");

module.exports.verifyJWTToken = (request, response, next) => {
    try {
        let rawToken = request.headers.authorization;
        if (!rawToken) {
            return response
                .status(403)
                .json({
                    status: false,
                    message: "No authorization token provided!",
                    data: null,
                });
        }

        // Support both "Bearer <token>" and plain "<token>"
        const token = rawToken.startsWith('Bearer ')
            ? rawToken.slice(7).trim()
            : rawToken.trim();

        if (!token) {
            return response
                .status(403)
                .json({
                    status: false,
                    message: "Invalid token or expired!",
                    data: null,
                });
        } else {
            jwt.verify(token, config.JWT_AUTH_TOKEN, (err, result) => {
                if (err) {
                    return response
                        .status(401)
                        .json({
                            status: false,
                            message: "You are Not Authorize",
                            data: null,
                        });
                } else {
                    if (result) {
                        request.user = result;           // standard Express pattern
                        if (!request.body) request.body = {};
                        request.body.user = result;      // backward compat for controllers
                        return next();
                    } else {
                        return response
                            .status(401)
                            .json({
                                status: false,
                                message: "Invalid token or expired!",
                                data: null,
                            });
                    }
                }
            });
        }
    } catch (e) {
        return response
            .status(500)
            .json({
                status: false,
                message: "Invalid token or expired!",
                data: null,
            });
    }
};