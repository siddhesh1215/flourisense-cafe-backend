const jwt = require("jsonwebtoken");
const config = require("./../config/config");
const { User, Reference } = require("./../models");

/**
 * Verify JWT Token for Admin Users
 * Checks if user is authenticated and has admin role
 */
module.exports.verifyAdminToken = async (request, response, next) => {
    try {
        let rawToken = request.headers.authorization;

        if (!rawToken) {
            return response.status(403).json({
                status: false,
                message: "No authorization token provided!",
                data: null,
            });
        }

        // Support both "Bearer <token>" and plain "<token>"
        const token = rawToken.startsWith("Bearer ")
            ? rawToken.slice(7).trim()
            : rawToken.trim();

        if (!token) {
            return response.status(403).json({
                status: false,
                message: "Invalid token or expired!",
                data: null,
            });
        }

        jwt.verify(token, config.JWT_AUTH_TOKEN, async (err, result) => {
            if (err) {
                return response.status(401).json({
                    status: false,
                    message: "You are not authorized",
                    data: null,
                });
            }

            if (!result) {
                return response.status(401).json({
                    status: false,
                    message: "Invalid token or expired!",
                    data: null,
                });
            }

            // Fetch user with role information
            const user = await User.findByPk(result.id, {
                include: [
                    {
                        model: Reference,
                        as: "role",
                        attributes: ["id", "name", "code"],
                    },
                ],
            });

            if (!user) {
                return response.status(401).json({
                    status: false,
                    message: "User not found",
                    data: null,
                });
            }

            // Check if user has admin role
            const isAdmin = user.role && user.role.name?.toLowerCase() === "admin";

            if (!isAdmin) {
                return response.status(403).json({
                    status: false,
                    message: "You do not have permission to access this resource. Admin role required.",
                    data: {
                        required_role: "admin",
                        user_role: user.role?.name || "unknown",
                    },
                });
            }

            // Attach authenticated user to request
            request.auth = result;   // decoded JWT payload
            request.user = user;     // full user from DB

            return next();
        });
    } catch (error) {
        console.error("[ADMIN MIDDLEWARE ERROR]", error);
        return response.status(500).json({
            status: false,
            message: "Authentication error",
            data: { error: error.message },
        });
    }
};