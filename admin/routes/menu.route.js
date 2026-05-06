const express = require('express');
const router = express.Router();

const { verifyAdminToken } = require('../../middleware/adminAuth.middleware');

// Controllers
const menuController = require('../controllers/menu.controller');
const feedbackController = require('../controllers/feedback.controller');
const ordersController = require('../controllers/orders.controller');
const analyticsController = require('../controllers/analytics.controller');
const locationController = require('../controllers/location.controller');

// Validators
const menuValidator = require('../validators/menu.validator');
const feedbackValidator = require('../validators/feedback.validator');
const ordersValidator = require('../validators/orders.validator');
const analyticsValidator = require('../validators/analytics.validator');
const locationValidator = require('../validators/location.validator');

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERS MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/v1/admin/orders - Get all orders
router.get(
  '/orders',
  verifyAdminToken,
  ordersValidator.getAll,
  ordersController.getAll
);

// GET /api/v1/admin/orders/active - Get active orders
router.get(
  '/orders/active',
  verifyAdminToken,
  ordersController.getActive
);

// GET /api/v1/admin/orders/today - Get today's orders
router.get(
  '/orders/today',
  verifyAdminToken,
  ordersController.getToday
);

// GET /api/v1/admin/orders/stats - Get order statistics
router.get(
  '/orders/stats',
  verifyAdminToken,
  ordersController.getStats
);

// GET /api/v1/admin/orders/:id - Get single order
router.get(
  '/orders/:id',
  verifyAdminToken,
  ordersValidator.getById,
  ordersController.getById
);

// PATCH /api/v1/admin/orders/:id/status - Update order status
router.patch(
  '/orders/:id/status',
  verifyAdminToken,
  ordersValidator.updateStatus,
  ordersController.updateStatus
);

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/v1/admin/analytics/dashboard - Get dashboard summary
router.get(
  '/analytics/dashboard',
  verifyAdminToken,
  analyticsController.getDashboard
);

// GET /api/v1/admin/analytics/revenue - Get revenue analytics
router.get(
  '/analytics/revenue',
  verifyAdminToken,
  analyticsValidator.getRevenue,
  analyticsController.getRevenue
);

// GET /api/v1/admin/analytics/orders - Get order analytics
router.get(
  '/analytics/orders',
  verifyAdminToken,
  analyticsController.getOrders
);

// GET /api/v1/admin/analytics/ratings - Get rating analytics
router.get(
  '/analytics/ratings',
  verifyAdminToken,
  analyticsController.getRatings
);

// GET /api/v1/admin/analytics/summary - Get complete analytics summary
router.get(
  '/analytics/summary',
  verifyAdminToken,
  analyticsController.getSummary
);

// GET /api/v1/admin/analytics/popular-items - Get popular items
router.get(
  '/analytics/popular-items',
  verifyAdminToken,
  analyticsValidator.getPopularItems,
  analyticsController.getPopularItems
);

// GET /api/v1/admin/analytics/peak-hours - Get peak ordering hours
router.get(
  '/analytics/peak-hours',
  verifyAdminToken,
  analyticsValidator.getPeakHours,
  analyticsController.getPeakHours
);

// ═══════════════════════════════════════════════════════════════════════════════
// MENU MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/admin/menu - Create new menu item
router.post(
  '/menu',
  verifyAdminToken,
  menuValidator.createMenu,
  menuController.create
);

// GET /api/v1/admin/menu - Get all menu items
router.get(
  '/menu',
  verifyAdminToken,
  menuController.getAll
);

// GET /api/v1/admin/menu/:id - Get single menu item
router.get(
  '/menu/:id',
  verifyAdminToken,
  menuController.getById
);

// PUT /api/v1/admin/menu/:id - Update full menu item
router.put(
  '/menu/:id',
  verifyAdminToken,
  menuValidator.updateMenu,
  menuController.update
);


// DELETE /api/v1/admin/menu/:id - Soft delete menu item
router.delete(
  '/menu/:id',
  verifyAdminToken,
  menuController.delete
);

// DELETE /api/v1/admin/menu/:id/permanent - Permanently delete menu item
router.delete(
  '/menu/:id/permanent',
  verifyAdminToken,
  menuController.deletePermanent
);

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/v1/admin/feedback - Get all feedback
router.get(
  '/feedback',
  verifyAdminToken,
  feedbackValidator.getAll,
  feedbackController.getAll
);

// GET /api/v1/admin/feedback/:id - Get single feedback
router.get(
  '/feedback/:id',
  verifyAdminToken,
  feedbackValidator.validateId,
  feedbackController.getById
);

// DELETE /api/v1/admin/feedback/:id - Soft delete feedback
router.delete(
  '/feedback/:id',
  verifyAdminToken,
  feedbackValidator.validateId,
  feedbackController.delete
);

// PATCH /api/v1/admin/feedback/:id/approve - Approve feedback
router.patch(
  '/feedback/:id/approve',
  verifyAdminToken,
  feedbackValidator.validateId,
  feedbackController.approveFeedback
);

// PATCH /api/v1/admin/feedback/:id/reject - Reject feedback
router.patch(
  '/feedback/:id/reject',
  verifyAdminToken,
  feedbackValidator.validateId,
  feedbackController.rejectFeedback
);

// GET /api/v1/admin/feedback/stats/summary - Get feedback statistics
router.get(
  '/feedback/stats/summary',
  verifyAdminToken,
  feedbackController.getStats
);

// DELETE /api/v1/admin/feedback/:id/permanent - Permanently delete feedback
router.delete(
  '/feedback/:id/permanent',
  verifyAdminToken,
  feedbackValidator.validateId,
  feedbackController.deletePermanent
);

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATION MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/admin/location - Create a new location
router.post(
  '/location',
  verifyAdminToken,
  locationValidator.createLocation,
  locationController.create
);

// GET /api/v1/admin/location - Get all locations
router.get(
  '/location',
  verifyAdminToken,
  locationController.getAll
);

// GET /api/v1/admin/location/:id - Get single location
router.get(
  '/location/:id',
  verifyAdminToken,
  locationValidator.validateId,
  locationController.getById
);

// PUT /api/v1/admin/location/:id - Update location
router.put(
  '/location/:id',
  verifyAdminToken,
  locationValidator.validateId,
  locationValidator.updateLocation,
  locationController.update
);

// DELETE /api/v1/admin/location/:id - Soft delete location
router.delete(
  '/location/:id',
  verifyAdminToken,
  locationValidator.validateId,
  locationController.delete
);

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATION ↔ MENU ITEM ASSIGNMENT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/admin/location/:id/menu-items - Assign menu items to a location
router.post(
  '/location/:id/menu-items',
  verifyAdminToken,
  locationValidator.validateId,
  locationValidator.assignMenuItems,
  locationController.assignMenuItems
);

// GET /api/v1/admin/location/:id/menu-items - Get all menu items for a location
router.get(
  '/location/:id/menu-items',
  verifyAdminToken,
  locationValidator.validateId,
  locationController.getMenuItems
);

// PATCH /api/v1/admin/location/:id/menu-items/:item_id - Toggle availability of item at location
router.patch(
  '/location/:id/menu-items/:item_id',
  verifyAdminToken,
  locationValidator.validateId,
  locationValidator.updateAvailability,
  locationController.updateMenuItemAvailability
);

// DELETE /api/v1/admin/location/:id/menu-items/:item_id - Remove menu item from location
router.delete(
  '/location/:id/menu-items/:item_id',
  verifyAdminToken,
  locationValidator.validateId,
  locationValidator.validateItemId,
  locationController.removeMenuItems
);

module.exports = router;

