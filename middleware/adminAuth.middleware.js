const jwt = require("jsonwebtoken");
const config = require("./../config/config");
const { User, Reference } = require("./../models");

/**
 * Helper — fetch user with role from DB given JWT decoded payload
 */
const getUserWithRole = async (decoded) => {
    return User.findByPk(decoded.id, {
        include: [
            {
                model: Reference,
                as: "role",
                attributes: ["id", "name", "code"],
            },
        ],
    });
};

// ─── verifyAdminToken ─────────────────────────────────────────────────────────
/**
 * Allows BOTH admin and super_admin to pass.
 * Used for all regular admin-protected routes.
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

        jwt.verify(token, config.JWT_AUTH_TOKEN, async (err, decoded) => {
            if (err) {
                return response.status(401).json({
                    status: false,
                    message: "You are not authorized",
                    data: null,
                });
            }

            if (!decoded) {
                return response.status(401).json({
                    status: false,
                    message: "Invalid token or expired!",
                    data: null,
                });
            }

            const user = await getUserWithRole(decoded);

            if (!user) {
                return response.status(401).json({
                    status: false,
                    message: "User not found",
                    data: null,
                });
            }

            // Allow both admin and super_admin
            const roleName = user.role?.name?.toLowerCase();
            const isAllowed = roleName === "admin" || roleName === "super_admin";

            if (!isAllowed) {
                return response.status(403).json({
                    status: false,
                    message: "You do not have permission to access this resource. Admin role required.",
                    data: {
                        required_role: "admin or super_admin",
                        user_role: user.role?.name || "unknown",
                    },
                });
            }

            // Attach to request
            request.auth = decoded;
            request.user = user;
            if (request.body) request.body.user = decoded;

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

// ─── verifySuperAdminToken ────────────────────────────────────────────────────
/**
 * Allows ONLY super_admin to pass.
 * Used for admin management routes (create/update/delete admins).
 */
module.exports.verifySuperAdminToken = async (request, response, next) => {
    try {
        let rawToken = request.headers.authorization;

        if (!rawToken) {
            return response.status(403).json({
                status: false,
                message: "No authorization token provided!",
                data: null,
            });
        }

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

        jwt.verify(token, config.JWT_AUTH_TOKEN, async (err, decoded) => {
            if (err) {
                return response.status(401).json({
                    status: false,
                    message: "You are not authorized",
                    data: null,
                });
            }

            if (!decoded) {
                return response.status(401).json({
                    status: false,
                    message: "Invalid token or expired!",
                    data: null,
                });
            }

            const user = await getUserWithRole(decoded);

            if (!user) {
                return response.status(401).json({
                    status: false,
                    message: "User not found",
                    data: null,
                });
            }

            const roleName = user.role?.name?.toLowerCase();

            if (roleName !== "super_admin") {
                return response.status(403).json({
                    status: false,
                    message: "Access denied. Super admin role required.",
                    data: {
                        required_role: "super_admin",
                        user_role: user.role?.name || "unknown",
                    },
                });
            }

            // Attach to request
            request.auth = decoded;
            request.user = user;
            if (request.body) request.body.user = decoded;

            return next();
        });
    } catch (error) {
        console.error("[SUPER ADMIN MIDDLEWARE ERROR]", error);
        return response.status(500).json({
            status: false,
            message: "Authentication error",
            data: { error: error.message },
        });
    }
};