const express = require('express');
const router = express.Router();

const { verifyAdminToken } = require('../../middleware/adminAuth.middleware');

const menuController      = require('../controllers/menu.controller');
const feedbackController  = require('../controllers/feedback.controller');
const ordersController    = require('../controllers/orders.controller');
const analyticsController = require('../controllers/analytics.controller');
const locationController  = require('../controllers/location.controller');

const menuValidator      = require('../validators/menu.validator');
const feedbackValidator  = require('../validators/feedback.validator');
const ordersValidator    = require('../validators/orders.validator');
const analyticsValidator = require('../validators/analytics.validator');
const locationValidator  = require('../validators/location.validator');

// ════════════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (with filters)
 *     tags: [Admin — Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, maximum: 100 }
 *       - in: query
 *         name: status
 *         schema: { type: integer }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date, example: "2026-01-01" }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date, example: "2026-12-31" }
 *     responses:
 *       200: { description: Paginated order list }
 */
router.get('/orders', verifyAdminToken, ordersValidator.getAll, ordersController.getAll);

/**
 * @swagger
 * /admin/orders/active:
 *   get:
 *     summary: Get all active (in-progress) orders
 *     tags: [Admin — Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Active orders }
 */
router.get('/orders/active', verifyAdminToken, ordersController.getActive);

/**
 * @swagger
 * /admin/orders/today:
 *   get:
 *     summary: Get today's orders
 *     tags: [Admin — Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Today's orders }
 */
router.get('/orders/today', verifyAdminToken, ordersController.getToday);

/**
 * @swagger
 * /admin/orders/stats:
 *   get:
 *     summary: Get order statistics
 *     tags: [Admin — Orders]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order stats }
 */
router.get('/orders/stats', verifyAdminToken, ordersController.getStats);

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Admin — Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Order details }
 *       404: { description: Not found }
 */
router.get('/orders/:id', verifyAdminToken, ordersValidator.getById, ordersController.getById);

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   patch:
 *     summary: Update the status of an order
 *     tags: [Admin — Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status_id]
 *             properties:
 *               status_id: { type: integer, example: 2 }
 *     responses:
 *       200: { description: Status updated }
 *       400: { description: Validation error }
 */
router.patch('/orders/:id/status', verifyAdminToken, ordersValidator.updateStatus, ordersController.updateStatus);

// ════════════════════════════════════════════════════════════════
// ANALYTICS
// ════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /admin/analytics/dashboard:
 *   get:
 *     summary: Get dashboard summary
 *     tags: [Admin — Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard KPIs }
 */
router.get('/analytics/dashboard', verifyAdminToken, analyticsController.getDashboard);

/**
 * @swagger
 * /admin/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Admin — Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: range
 *         schema: { type: string, enum: [daily, weekly, monthly] }
 *     responses:
 *       200: { description: Revenue data }
 */
router.get('/analytics/revenue', verifyAdminToken, analyticsValidator.getRevenue, analyticsController.getRevenue);

/**
 * @swagger
 * /admin/analytics/orders:
 *   get:
 *     summary: Get order analytics
 *     tags: [Admin — Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order analytics }
 */
router.get('/analytics/orders', verifyAdminToken, analyticsController.getOrders);

/**
 * @swagger
 * /admin/analytics/ratings:
 *   get:
 *     summary: Get rating analytics
 *     tags: [Admin — Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Rating breakdown }
 */
router.get('/analytics/ratings', verifyAdminToken, analyticsController.getRatings);

/**
 * @swagger
 * /admin/analytics/summary:
 *   get:
 *     summary: Get complete analytics summary
 *     tags: [Admin — Analytics]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Full analytics summary }
 */
router.get('/analytics/summary', verifyAdminToken, analyticsController.getSummary);

/**
 * @swagger
 * /admin/analytics/popular-items:
 *   get:
 *     summary: Get most popular menu items
 *     tags: [Admin — Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, maximum: 100 }
 *       - in: query
 *         name: days
 *         schema: { type: integer, maximum: 365 }
 *     responses:
 *       200: { description: Popular items }
 */
router.get('/analytics/popular-items', verifyAdminToken, analyticsValidator.getPopularItems, analyticsController.getPopularItems);

/**
 * @swagger
 * /admin/analytics/peak-hours:
 *   get:
 *     summary: Get peak ordering hours
 *     tags: [Admin — Analytics]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema: { type: integer, maximum: 365 }
 *     responses:
 *       200: { description: Peak hours data }
 */
router.get('/analytics/peak-hours', verifyAdminToken, analyticsValidator.getPeakHours, analyticsController.getPeakHours);

// ════════════════════════════════════════════════════════════════
// MENU
// ════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /admin/menu:
 *   post:
 *     summary: Create a new menu item
 *     tags: [Admin — Menu]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category_id]
 *             properties:
 *               name:          { type: string, example: Espresso }
 *               price:         { type: number, example: 120.00 }
 *               category_id:   { type: integer, example: 1 }
 *               description:   { type: string }
 *               display_order: { type: integer }
 *               is_popular:    { type: boolean }
 *               is_available:  { type: boolean }
 *     responses:
 *       201: { description: Menu item created }
 *       400: { description: Validation error }
 *   get:
 *     summary: Get all menu items
 *     tags: [Admin — Menu]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Menu list }
 */
router.post('/menu', verifyAdminToken, menuValidator.createMenu, menuController.create);
router.get('/menu', verifyAdminToken, menuController.getAll);

/**
 * @swagger
 * /admin/menu/{id}:
 *   get:
 *     summary: Get a single menu item by ID
 *     tags: [Admin — Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Menu item }
 *       404: { description: Not found }
 *   put:
 *     summary: Update a menu item
 *     tags: [Admin — Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:          { type: string }
 *               price:         { type: number }
 *               category_id:   { type: integer }
 *               description:   { type: string }
 *               display_order: { type: integer }
 *               is_popular:    { type: boolean }
 *               is_available:  { type: boolean }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     summary: Soft-delete a menu item
 *     tags: [Admin — Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
router.get('/menu/:id', verifyAdminToken, menuController.getById);
router.put('/menu/:id', verifyAdminToken, menuValidator.updateMenu, menuController.update);
router.delete('/menu/:id', verifyAdminToken, menuController.delete);

/**
 * @swagger
 * /admin/menu/{id}/price:
 *   patch:
 *     summary: Update price of a menu item
 *     tags: [Admin — Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [price]
 *             properties:
 *               price: { type: number, example: 149.99 }
 *     responses:
 *       200: { description: Price updated }
 */
router.patch('/menu/:id/price', verifyAdminToken, menuValidator.updatePrice, menuController.updatePrice);

/**
 * @swagger
 * /admin/menu/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a menu item
 *     tags: [Admin — Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Permanently deleted }
 */
router.delete('/menu/:id/permanent', verifyAdminToken, menuController.deletePermanent);

// ════════════════════════════════════════════════════════════════
// FEEDBACK
// ════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /admin/feedback:
 *   get:
 *     summary: Get all feedback (with filters)
 *     tags: [Admin — Feedback]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, maximum: 100 }
 *       - in: query
 *         name: rating
 *         schema: { type: integer, minimum: 1, maximum: 5 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: Feedback list }
 */
router.get('/feedback', verifyAdminToken, feedbackValidator.getAll, feedbackController.getAll);

/**
 * @swagger
 * /admin/feedback/stats/summary:
 *   get:
 *     summary: Get feedback statistics
 *     tags: [Admin — Feedback]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Feedback stats }
 */
router.get('/feedback/stats/summary', verifyAdminToken, feedbackController.getStats);

/**
 * @swagger
 * /admin/feedback/{id}:
 *   get:
 *     summary: Get a single feedback entry
 *     tags: [Admin — Feedback]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Feedback }
 *       404: { description: Not found }
 *   delete:
 *     summary: Soft-delete a feedback entry
 *     tags: [Admin — Feedback]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
router.get('/feedback/:id', verifyAdminToken, feedbackValidator.validateId, feedbackController.getById);
router.delete('/feedback/:id', verifyAdminToken, feedbackValidator.validateId, feedbackController.delete);

/**
 * @swagger
 * /admin/feedback/{id}/status:
 *   patch:
 *     summary: Update the status of a feedback entry
 *     tags: [Admin — Feedback]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [active, inactive, resolved] }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch('/feedback/:id/status', verifyAdminToken, feedbackValidator.validateId, feedbackValidator.updateStatus, feedbackController.updateStatus);

/**
 * @swagger
 * /admin/feedback/{id}/permanent:
 *   delete:
 *     summary: Permanently delete a feedback entry
 *     tags: [Admin — Feedback]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Permanently deleted }
 */
router.delete('/feedback/:id/permanent', verifyAdminToken, feedbackValidator.validateId, feedbackController.deletePermanent);

// ════════════════════════════════════════════════════════════════
// LOCATION
// ════════════════════════════════════════════════════════════════

/**
 * @swagger
 * /admin/location:
 *   post:
 *     summary: Create a new location
 *     tags: [Admin — Location]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Main Branch }
 *               code: { type: string, example: MB01 }
 *               city: { type: string, example: Pune }
 *     responses:
 *       201: { description: Location created }
 *       400: { description: Validation error }
 *   get:
 *     summary: Get all locations
 *     tags: [Admin — Location]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Location list }
 */
router.post('/location', verifyAdminToken, locationValidator.createLocation, locationController.create);
router.get('/location', verifyAdminToken, locationController.getAll);

/**
 * @swagger
 * /admin/location/{id}:
 *   get:
 *     summary: Get a single location by ID
 *     tags: [Admin — Location]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Location details }
 *       404: { description: Not found }
 *   put:
 *     summary: Update a location
 *     tags: [Admin — Location]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:     { type: string }
 *               code:     { type: string }
 *               inactive: { type: boolean }
 *     responses:
 *       200: { description: Updated }
 *   delete:
 *     summary: Soft-delete a location
 *     tags: [Admin — Location]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Deleted }
 */
router.get('/location/:id', verifyAdminToken, locationValidator.validateId, locationController.getById);
router.put('/location/:id', verifyAdminToken, locationValidator.validateId, locationValidator.updateLocation, locationController.update);
router.delete('/location/:id', verifyAdminToken, locationValidator.validateId, locationController.delete);

/**
 * @swagger
 * /admin/location/{id}/menu-items:
 *   post:
 *     summary: Assign menu items to a location
 *     tags: [Admin — Location]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [menu_item_ids]
 *             properties:
 *               menu_item_ids: { type: array, items: { type: integer }, example: [1, 2, 3] }
 *     responses:
 *       200: { description: Items assigned }
 *   get:
 *     summary: Get all menu items assigned to a location
 *     tags: [Admin — Location]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Assigned items }
 */
router.post('/location/:id/menu-items', verifyAdminToken, locationValidator.validateId, locationValidator.assignMenuItems, locationController.assignMenuItems);
router.get('/location/:id/menu-items', verifyAdminToken, locationValidator.validateId, locationController.getMenuItems);

/**
 * @swagger
 * /admin/location/{id}/menu-items/{item_id}:
 *   patch:
 *     summary: Toggle availability of a menu item at a location
 *     tags: [Admin — Location]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [is_available]
 *             properties:
 *               is_available: { type: boolean, example: false }
 *     responses:
 *       200: { description: Availability toggled }
 *   delete:
 *     summary: Remove a menu item from a location
 *     tags: [Admin — Location]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: item_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Item removed from location }
 */
router.patch('/location/:id/menu-items/:item_id', verifyAdminToken, locationValidator.validateId, locationValidator.updateAvailability, locationController.updateMenuItemAvailability);
router.delete('/location/:id/menu-items/:item_id', verifyAdminToken, locationValidator.validateId, locationValidator.validateItemId, locationController.removeMenuItems);

module.exports = router;
