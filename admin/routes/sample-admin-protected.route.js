/**
 * SAMPLE ADMIN ROUTES WITH ROLE-BASED PROTECTION
 * 
 * This file demonstrates how to set up protected admin routes
 * that verify the user has admin role before allowing access.
 * 
 * Usage:
 *   const adminProtectedRouter = require('./sample-admin-protected.route');
 *   app.use('/api/admin', adminProtectedRouter);
 * 
 * PROTECTED ENDPOINTS:
 *   POST   /api/admin/dashboard          → Get admin dashboard data
 *   GET    /api/admin/analytics          → Get analytics
 *   PUT    /api/admin/users/:id          → Update user
 *   DELETE /api/admin/users/:id          → Delete user
 *   GET    /api/admin/settings           → Get system settings
 */

const express = require("express");
const router = express.Router();

// Import the admin role verification middleware
const { verifyAdminRole, verifyAdminRoleWithDB } = require("../../middleware/verifyAdminRole.middleware");

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 1: Using Fast Admin Middleware (JWT-based, no DB call)
// ═══════════════════════════════════════════════════════════════════════════════
// Pros: Faster, lower DB load
// Cons: If admin role is revoked in DB, won't be immediately reflected
// Best for: Most use cases, regular admin operations

/**
 * Sample: Get Admin Dashboard
 * 
 * Request:
 *   POST /api/admin/dashboard
 *   Headers:
 *     Authorization: Bearer <jwt_token>
 * 
 * Response (Success):
 *   {
 *     "status": true,
 *     "message": "Dashboard data retrieved",
 *     "data": {
 *       "totalUsers": 150,
 *       "totalOrders": 500,
 *       "revenue": 50000,
 *       ...
 *     }
 *   }
 * 
 * Response (Forbidden):
 *   {
 *     "status": false,
 *     "message": "Access denied. Admin role required.",
 *     "data": {
 *       "required": "admin",
 *       "actual": "user"
 *     }
 *   }
 */
router.post(
  "/dashboard",
  verifyAdminRole,
  async (request, response) => {
    try {
      // User is guaranteed to be admin here
      const admin = request.user;

      // Sample dashboard data (in real app, query from DB)
      const dashboardData = {
        adminId: admin.id,
        adminEmail: admin.email,
        adminName: admin.name,
        totalUsers: 150,
        totalOrders: 500,
        revenue: 50000,
        pendingOrders: 23,
        lastUpdated: new Date(),
      };

      return response.status(200).json({
        status: true,
        message: "Dashboard data retrieved successfully",
        data: dashboardData,
      });
    } catch (error) {
      console.error('[ADMIN DASHBOARD ERROR]', error);
      return response.status(500).json({
        status: false,
        message: "Failed to fetch dashboard data",
        data: null,
      });
    }
  }
);

/**
 * Sample: Get Analytics
 * 
 * Request:
 *   GET /api/admin/analytics?startDate=2026-01-01&endDate=2026-05-03
 *   Headers:
 *     Authorization: Bearer <jwt_token>
 */
router.get(
  "/analytics",
  verifyAdminRole,
  async (request, response) => {
    try {
      const { startDate, endDate } = request.query;
      const admin = request.user;

      console.log(`[ANALYTICS] Admin ${admin.email} requested analytics for ${startDate} to ${endDate}`);

      const analyticsData = {
        dateRange: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate || new Date(),
        },
        orderStats: {
          total: 500,
          completed: 450,
          pending: 30,
          cancelled: 20,
        },
        revenue: {
          total: 50000,
          byCategory: {
            coffee: 25000,
            pastries: 15000,
            drinks: 10000,
          },
        },
        userStats: {
          newUsers: 50,
          activeUsers: 120,
          churnedUsers: 10,
        },
      };

      return response.status(200).json({
        status: true,
        message: "Analytics retrieved successfully",
        data: analyticsData,
      });
    } catch (error) {
      console.error('[ANALYTICS ERROR]', error);
      return response.status(500).json({
        status: false,
        message: "Failed to fetch analytics",
        data: null,
      });
    }
  }
);

/**
 * Sample: Update User (Admin only)
 * 
 * Request:
 *   PUT /api/admin/users/15
 *   Headers:
 *     Authorization: Bearer <jwt_token>
 *   Body:
 *     {
 *       "name": "John Updated",
 *       "phone": "1234567890"
 *     }
 */
router.put(
  "/users/:userId",
  verifyAdminRole,
  async (request, response) => {
    try {
      const { userId } = request.params;
      const { name, phone } = request.body;
      const admin = request.user;

      console.log(`[ADMIN UPDATE USER] Admin ${admin.email} is updating user ${userId}`);

      // In real app, query DB to update user
      const updatedUser = {
        id: userId,
        name: name || "John Doe",
        phone: phone || "9876543210",
        updatedBy: admin.id,
        updatedAt: new Date(),
      };

      return response.status(200).json({
        status: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error('[UPDATE USER ERROR]', error);
      return response.status(500).json({
        status: false,
        message: "Failed to update user",
        data: null,
      });
    }
  }
);

/**
 * Sample: Delete User (Admin only)
 * 
 * Request:
 *   DELETE /api/admin/users/15
 *   Headers:
 *     Authorization: Bearer <jwt_token>
 */
router.delete(
  "/users/:userId",
  verifyAdminRole,
  async (request, response) => {
    try {
      const { userId } = request.params;
      const admin = request.user;

      console.log(`[ADMIN DELETE USER] Admin ${admin.email} is deleting user ${userId}`);

      return response.status(200).json({
        status: true,
        message: "User deleted successfully",
        data: {
          deletedUserId: userId,
          deletedBy: admin.id,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('[DELETE USER ERROR]', error);
      return response.status(500).json({
        status: false,
        message: "Failed to delete user",
        data: null,
      });
    }
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// OPTION 2: Using Database-Based Admin Middleware
// ═══════════════════════════════════════════════════════════════════════════════
// Pros: More secure, real-time role revocation
// Cons: Slower due to DB call on every request
// Best for: Sensitive operations like user deletion, role changes

/**
 * Sample: Get System Settings (Sensitive - uses DB verification)
 * 
 * Request:
 *   GET /api/admin/settings
 *   Headers:
 *     Authorization: Bearer <jwt_token>
 */
router.get(
  "/settings",
  verifyAdminRoleWithDB,
  async (request, response) => {
    try {
      const admin = request.user;

      console.log(`[ADMIN SETTINGS] Admin ${admin.email} accessed system settings`);

      const settings = {
        systemName: "Flourisense Cafe",
        timezone: "UTC",
        currency: "USD",
        maxOrderItems: 50,
        otpExpireMinutes: 10,
        jwtExpiresIn: "24h",
        maintenanceMode: false,
        adminNotifications: true,
      };

      return response.status(200).json({
        status: true,
        message: "System settings retrieved",
        data: settings,
      });
    } catch (error) {
      console.error('[SETTINGS ERROR]', error);
      return response.status(500).json({
        status: false,
        message: "Failed to fetch settings",
        data: null,
      });
    }
  }
);

/**
 * Sample: Update System Settings (Sensitive - uses DB verification)
 * 
 * Request:
 *   PUT /api/admin/settings
 *   Headers:
 *     Authorization: Bearer <jwt_token>
 *   Body:
 *     {
 *       "maxOrderItems": 100,
 *       "otpExpireMinutes": 15
 *     }
 */
router.put(
  "/settings",
  verifyAdminRoleWithDB,
  async (request, response) => {
    try {
      const { systemName, timezone, currency, maxOrderItems } = request.body;
      const admin = request.user;

      console.log(`[ADMIN UPDATE SETTINGS] Admin ${admin.email} updated system settings`);

      const updatedSettings = {
        systemName: systemName || "Flourisense Cafe",
        timezone: timezone || "UTC",
        currency: currency || "USD",
        maxOrderItems: maxOrderItems || 50,
        updatedBy: admin.id,
        updatedAt: new Date(),
      };

      return response.status(200).json({
        status: true,
        message: "System settings updated successfully",
        data: updatedSettings,
      });
    } catch (error) {
      console.error('[UPDATE SETTINGS ERROR]', error);
      return response.status(500).json({
        status: false,
        message: "Failed to update settings",
        data: null,
      });
    }
  }
);

module.exports = router;
