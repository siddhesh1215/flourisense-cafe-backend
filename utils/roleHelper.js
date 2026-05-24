/**
 * Role Helper Utilities
 * Handles role ID to role name mapping and role checking
 */

const { Reference } = require('../models');

// Cache for roles to avoid repeated DB queries
let roleCache = null;
let roleCacheExpiry = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get all roles from database (with caching)
 */
const getAllRoles = async () => {
    const now = Date.now();
    
    // Return cached roles if still valid
    if (roleCache && now < roleCacheExpiry) {
        return roleCache;
    }

    try {
        const roles = await Reference.findAll({
            where: { name: ['admin', 'user'] },
            attributes: ['id', 'name', 'code'],
            raw: true,
        });

        // Cache the roles
        roleCache = roles;
        roleCacheExpiry = now + CACHE_DURATION;

        return roles;
    } catch (error) {
        console.error('[ROLE HELPER] Error fetching roles:', error);
        return [];
    }
};

/**
 * Get role ID by role name
 */
const getRoleIdByName = async (roleName) => {
    const roles = await getAllRoles();
    const role = roles.find(r => r.name?.toLowerCase() === roleName.toLowerCase());
    return role ? role.id : null;
};

/**
 * Get role name by role ID
 */
const getRoleNameById = async (roleId) => {
    const roles = await getAllRoles();
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : null;
};

/**
 * Check if user has admin role
 */
const isAdminRole = (roleId, adminRoleId) => {
    return roleId === adminRoleId;
};

/**
 * Invalidate role cache (useful when new roles are created)
 */
const invalidateRoleCache = () => {
    roleCache = null;
    roleCacheExpiry = 0;
};

module.exports = {
    getAllRoles,
    getRoleIdByName,
    getRoleNameById,
    isAdminRole,
    invalidateRoleCache,
};