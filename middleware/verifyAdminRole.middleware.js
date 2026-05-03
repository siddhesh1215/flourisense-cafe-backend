/**
 * Admin Role Authorization Middleware
 * Ensures user has admin role before accessing protected routes
 * 
 * Usage:
 *   router.post('/admin/route', verifyAdminRole, adminController.handler);
 */

const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { User, Reference } = require("../models");
const { getRoleIdByName } = require("../utils/roleHelper");

/**
 * Verify JWT token and check if user has admin role
 * Faster alternative to fetching from DB - checks role_id in JWT directly
 */
module.exports.verifyAdminRole = async (request, response, next) => {
    try {
        let rawToken = request.headers.authorization;

        if (!rawToken) {
            return response.status(401).json({
                status: false,
                message: "No authorization token provided",
                data: null,
            });
        }

        // Support both "Bearer <token>" and plain "<token>"
        const token = rawToken.startsWith('Bearer ')
            ? rawToken.slice(7).trim()
            : rawToken.trim();

        if (!token) {
            return response.status(401).json({
                status: false,
                message: "Invalid or missing token",
                data: null,
            });
        }

        // Verify and decode JWT
        jwt.verify(token, config.JWT_AUTH_TOKEN, async (err, decoded) => {
            if (err) {
                return response.status(401).json({
                    status: false,
                    message: "Token expired or invalid",
                    data: null,
                });
            }

            if (!decoded) {
                return response.status(401).json({
                    status: false,
                    message: "Invalid token payload",
                    data: null,
                });
            }

            // ═══════════════════════════════════════════════════════════════
            // CHECK ADMIN ROLE
            // ═══════════════════════════════════════════════════════════════

            // Get admin role ID
            const adminRoleId = await getRoleIdByName('admin');

            // Check if user's role_id matches admin role_id
            if (decoded.role_id !== adminRoleId) {
                return response.status(403).json({
                    status: false,
                    message: "Access denied. Admin role required.",
                    data: {
                        required: 'admin',
                        actual: 'user',
                    },
                });
            }

            // Verify user still exists and is not deleted
            const user = await User.findByPk(decoded.id, {
                attributes: ['id', 'email', 'name', 'role_id', 'is_verified'],
            });

            if (!user) {
                return response.status(401).json({
                    status: false,
                    message: "User not found",
                    data: null,
                });
            }

            if (!user.is_verified) {
                return response.status(403).json({
                    status: false,
                    message: "Admin account must be verified",
                    data: null,
                });
            }

            // Attach decoded token and user to request
            request.user = {
                id: decoded.id,
                email: decoded.email,
                role_id: decoded.role_id,
                name: user.name,
                isAdmin: true,
            };

            // Also attach to body for backward compatibility
            request.body.user = decoded;

            return next();
        });
    } catch (error) {
        console.error('[ADMIN MIDDLEWARE ERROR]', error);
        return response.status(500).json({
            status: false,
            message: "Authentication error",
            data: null,
        });
    }
};

/**
 * Alternative: Verify admin JWT with database role lookup
 * More robust - fetches role from DB to ensure it hasn't been revoked
 * Slower due to DB call but safer for sensitive operations
 * 
 * Usage:
 *   router.post('/admin/route', verifyAdminRoleWithDB, adminController.handler);
 */
module.exports.verifyAdminRoleWithDB = async (request, response, next) => {
    try {
        let rawToken = request.headers.authorization;

        if (!rawToken) {
            return response.status(401).json({
                status: false,
                message: "No authorization token provided",
                data: null,
            });
        }

        const token = rawToken.startsWith('Bearer ')
            ? rawToken.slice(7).trim()
            : rawToken.trim();

        if (!token) {
            return response.status(401).json({
                status: false,
                message: "Invalid or missing token",
                data: null,
            });
        }

        jwt.verify(token, config.JWT_AUTH_TOKEN, async (err, decoded) => {
            if (err) {
                return response.status(401).json({
                    status: false,
                    message: "Token expired or invalid",
                    data: null,
                });
            }

            // Fetch user with role from database
            const user = await User.findByPk(decoded.id, {
                include: [
                    {
                        model: Reference,
                        as: 'role',
                        attributes: ['id', 'name', 'code'],
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

            if (!user.is_verified) {
                return response.status(403).json({
                    status: false,
                    message: "Admin account must be verified",
                    data: null,
                });
            }

            // Check if user has admin role
            const isAdmin = user.role && user.role.name?.toLowerCase() === 'admin';

            if (!isAdmin) {
                return response.status(403).json({
                    status: false,
                    message: "Access denied. Admin role required.",
                    data: {
                        required: 'admin',
                        actual: user.role?.name || 'unknown',
                    },
                });
            }

            // Attach user to request
            request.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role_id: user.role_id,
                role: user.role,
                isAdmin: true,
            };

            request.body.user = decoded;
            return next();
        });
    } catch (error) {
        console.error('[ADMIN MIDDLEWARE DB ERROR]', error);
        return response.status(500).json({
            status: false,
            message: "Authentication error",
            data: null,
        });
    }
};
