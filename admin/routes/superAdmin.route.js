const express = require('express');
const router = express.Router();

const { verifySuperAdminToken } = require('../../middleware/adminAuth.middleware');
const superAdminController = require('../controllers/superAdmin.controller');
const superAdminValidator = require('../validators/superAdmin.validator');

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MANAGEMENT (super_admin only)
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/v1/admin/super/admins — Create a new admin account
router.post(
  '/admins',
  verifySuperAdminToken,
  superAdminValidator.createAdmin,
  superAdminController.createAdmin
);

// GET /api/v1/admin/super/admins — List all admins
router.get(
  '/admins',
  verifySuperAdminToken,
  superAdminController.getAllAdmins
);

// GET /api/v1/admin/super/admins/:id — Get single admin
router.get(
  '/admins/:id',
  verifySuperAdminToken,
  superAdminValidator.validateId,
  superAdminController.getAdminById
);

// PUT /api/v1/admin/super/admins/:id — Update admin details
router.put(
  '/admins/:id',
  verifySuperAdminToken,
  superAdminValidator.validateId,
  superAdminValidator.updateAdmin,
  superAdminController.updateAdmin
);

// PATCH /api/v1/admin/super/admins/:id/toggle — Activate / deactivate admin
router.patch(
  '/admins/:id/toggle',
  verifySuperAdminToken,
  superAdminValidator.validateId,
  superAdminValidator.toggle,
  superAdminController.toggleAdmin
);

// PATCH /api/v1/admin/super/admins/:id/reset-password — Reset admin password
router.patch(
  '/admins/:id/reset-password',
  verifySuperAdminToken,
  superAdminValidator.validateId,
  superAdminValidator.resetPassword,
  superAdminController.resetAdminPassword
);

// DELETE /api/v1/admin/super/admins/:id — Soft delete admin
router.delete(
  '/admins/:id',
  verifySuperAdminToken,
  superAdminValidator.validateId,
  superAdminController.deleteAdmin
);

// ═══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT (super_admin only)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/v1/admin/super/users — List all regular users
router.get(
  '/users',
  verifySuperAdminToken,
  superAdminController.getAllUsers
);

// GET /api/v1/admin/super/users/:id — Get single user
router.get(
  '/users/:id',
  verifySuperAdminToken,
  superAdminValidator.validateId,
  superAdminController.getUserById
);

// PATCH /api/v1/admin/super/users/:id/toggle — Activate / deactivate user
router.patch(
  '/users/:id/toggle',
  verifySuperAdminToken,
  superAdminValidator.validateId,
  superAdminValidator.toggle,
  superAdminController.toggleUser
);

module.exports = router;
