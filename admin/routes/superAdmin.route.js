const express = require('express');
const router = express.Router();

const { verifySuperAdminToken } = require('../../middleware/adminAuth.middleware');
const superAdminController = require('../controllers/superAdmin.controller');
const superAdminValidator = require('../validators/superAdmin.validator');

/**
 * @swagger
 * /admin/super/admins:
 *   post:
 *     summary: Create a new admin account
 *     tags: [Super Admin]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:     { type: string, example: New Admin }
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               phone:    { type: string, example: "9876543210" }
 *     responses:
 *       201: { description: Admin created }
 *       400: { description: Validation error }
 *       403: { description: Super admin access required }
 *   get:
 *     summary: List all admin accounts
 *     tags: [Super Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin list }
 */
router.post('/admins', verifySuperAdminToken, superAdminValidator.createAdmin, superAdminController.createAdmin);
router.get('/admins', verifySuperAdminToken, superAdminController.getAllAdmins);

/**
 * @swagger
 * /admin/super/admins/{id}:
 *   get:
 *     summary: Get a single admin by ID
 *     tags: [Super Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Admin details }
 *       404: { description: Not found }
 *   put:
 *     summary: Update admin name / email
 *     tags: [Super Admin]
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
 *               name:  { type: string }
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Admin updated }
 *   delete:
 *     summary: Soft-delete an admin
 *     tags: [Super Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Admin deleted }
 */
router.get('/admins/:id', verifySuperAdminToken, superAdminValidator.validateId, superAdminController.getAdminById);
router.put('/admins/:id', verifySuperAdminToken, superAdminValidator.validateId, superAdminValidator.updateAdmin, superAdminController.updateAdmin);
router.delete('/admins/:id', verifySuperAdminToken, superAdminValidator.validateId, superAdminController.deleteAdmin);

/**
 * @swagger
 * /admin/super/admins/{id}/toggle:
 *   patch:
 *     summary: Activate or deactivate an admin
 *     tags: [Super Admin]
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
 *             required: [inactive]
 *             properties:
 *               inactive: { type: boolean, example: true }
 *     responses:
 *       200: { description: Status toggled }
 */
router.patch('/admins/:id/toggle', verifySuperAdminToken, superAdminValidator.validateId, superAdminValidator.toggle, superAdminController.toggleAdmin);

/**
 * @swagger
 * /admin/super/admins/{id}/reset-password:
 *   patch:
 *     summary: Reset an admin's password
 *     tags: [Super Admin]
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
 *             required: [new_password]
 *             properties:
 *               new_password: { type: string, minLength: 6 }
 *     responses:
 *       200: { description: Password reset }
 */
router.patch('/admins/:id/reset-password', verifySuperAdminToken, superAdminValidator.validateId, superAdminValidator.resetPassword, superAdminController.resetAdminPassword);

/**
 * @swagger
 * /admin/super/users:
 *   get:
 *     summary: List all regular users
 *     tags: [Super Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User list }
 */
router.get('/users', verifySuperAdminToken, superAdminController.getAllUsers);

/**
 * @swagger
 * /admin/super/users/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     tags: [Super Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: User details }
 *       404: { description: Not found }
 */
router.get('/users/:id', verifySuperAdminToken, superAdminValidator.validateId, superAdminController.getUserById);

/**
 * @swagger
 * /admin/super/users/{id}/toggle:
 *   patch:
 *     summary: Activate or deactivate a user
 *     tags: [Super Admin]
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
 *             required: [inactive]
 *             properties:
 *               inactive: { type: boolean, example: false }
 *     responses:
 *       200: { description: User status toggled }
 */
router.patch('/users/:id/toggle', verifySuperAdminToken, superAdminValidator.validateId, superAdminValidator.toggle, superAdminController.toggleUser);

module.exports = router;
