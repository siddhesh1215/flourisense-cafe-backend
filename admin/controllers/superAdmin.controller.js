const { User, Reference } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { createAndSendOTP } = require('../../services/otpService');
const { success, created, badRequest, notFound, serverError } = require('../../utils/response.helper');

// ─── Common include: user with role ──────────────────────────────────────────
const userWithRole = {
  model: Reference,
  as: 'role',
  attributes: ['id', 'name', 'code'],
};

// ─── Helper: safe user attributes (no password) ──────────────────────────────
const safeAttributes = ['id', 'name', 'email', 'phone', 'is_verified', 'role_id', 'created_on', 'updated_on', 'inactive'];

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MANAGEMENT (super_admin only)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── POST /admin/super/admins ─────────────────────────────────────────────────
/**
 * Super Admin creates a new admin account.
 * Sends OTP to the new admin's email for email verification.
 */
module.exports.createAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, user } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (existing) return badRequest(res, `An account with email "${email}" already exists`);

    // Fetch admin role
    const adminRole = await Reference.findOne({ where: { name: 'admin' } });
    if (!adminRole) return serverError(res, new Error('Admin role not found in database. Run seed script first.'));

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || null,
      password: hashedPassword,
      is_verified: false,
      role_id: adminRole.id,
      inactive: false,
      created_on: new Date(),
      updated_on: new Date(),
      created_by: user?.id || null,
      updated_by: user?.id || null,
    });

    console.log(`[SUPER ADMIN] ✅ Admin created: ${newAdmin.id} (${newAdmin.email}) by super_admin: ${user?.id}`);

    // Send OTP for email verification
    const otpResult = await createAndSendOTP(newAdmin.id, newAdmin.email, newAdmin.name);

    if (!otpResult.success) {
      await User.destroy({ where: { id: newAdmin.id } });
      return serverError(res, new Error(otpResult.message));
    }

    return created(res, 'Admin account created successfully. OTP sent to their email for verification.', {
      adminId: newAdmin.id,
      email: newAdmin.email,
      name: newAdmin.name,
      role: 'admin',
      is_verified: false,
      otpExpiresIn: `${otpResult.expiresIn} minutes`,
    });
  } catch (error) {
    console.error('[SUPER ADMIN CREATE ADMIN ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/super/admins ──────────────────────────────────────────────────
/**
 * List all admin accounts (excludes super_admins and regular users).
 * Query: ?search=, ?is_verified=true|false, ?inactive=true|false
 */
module.exports.getAllAdmins = async (req, res) => {
  try {
    const { search, is_verified, inactive } = req.query;

    // Get admin role ID
    const adminRole = await Reference.findOne({ where: { name: 'admin' } });
    if (!adminRole) return serverError(res, new Error('Admin role not found'));

    const where = { role_id: adminRole.id };

    if (is_verified !== undefined) where.is_verified = is_verified === 'true';
    if (inactive !== undefined) where.inactive = inactive === 'true';

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const admins = await User.findAll({
      where,
      attributes: safeAttributes,
      include: [userWithRole],
      order: [['created_on', 'DESC']],
    });

    return success(res, 'Admin accounts fetched successfully', {
      count: admins.length,
      admins,
    });
  } catch (error) {
    console.error('[SUPER ADMIN GET ALL ADMINS ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/super/admins/:id ──────────────────────────────────────────────
/**
 * Get a single admin by ID
 */
module.exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const adminRole = await Reference.findOne({ where: { name: 'admin' } });

    const admin = await User.findOne({
      where: { id, role_id: adminRole?.id },
      attributes: safeAttributes,
      include: [userWithRole],
    });

    if (!admin) return notFound(res, 'Admin account not found');

    return success(res, 'Admin account fetched successfully', admin);
  } catch (error) {
    console.error('[SUPER ADMIN GET ADMIN BY ID ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PUT /admin/super/admins/:id ──────────────────────────────────────────────
/**
 * Update admin name, email, phone
 */
module.exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, user } = req.body;

    const admin = await User.findByPk(id, { include: [userWithRole] });
    if (!admin) return notFound(res, 'Admin account not found');

    const roleName = admin.role?.name?.toLowerCase();
    if (roleName !== 'admin') return badRequest(res, 'Can only update admin accounts via this endpoint');

    if (email && email.toLowerCase().trim() !== admin.email) {
      const duplicate = await User.findOne({ where: { email: email.toLowerCase().trim() } });
      if (duplicate) return badRequest(res, `Email "${email}" is already in use`);
    }

    await admin.update({
      name: name ? name.trim() : admin.name,
      email: email ? email.toLowerCase().trim() : admin.email,
      phone: phone !== undefined ? phone : admin.phone,
      updated_on: new Date(),
      updated_by: user?.id || null,
    });

    const updated = await User.findByPk(id, { attributes: safeAttributes, include: [userWithRole] });
    return success(res, 'Admin account updated successfully', updated);
  } catch (error) {
    console.error('[SUPER ADMIN UPDATE ADMIN ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PATCH /admin/super/admins/:id/toggle ─────────────────────────────────────
/**
 * Activate or deactivate an admin account.
 * Body: { inactive: true|false }
 */
module.exports.toggleAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { inactive, user } = req.body;

    const admin = await User.findByPk(id, { include: [userWithRole] });
    if (!admin) return notFound(res, 'Admin account not found');

    const roleName = admin.role?.name?.toLowerCase();
    if (roleName !== 'admin') return badRequest(res, 'Can only toggle admin accounts via this endpoint');

    // Prevent super admin from disabling themselves
    if (user?.id && parseInt(id) === parseInt(user.id)) {
      return badRequest(res, 'You cannot deactivate your own account');
    }

    await admin.update({ inactive, updated_on: new Date(), updated_by: user?.id || null });

    const statusLabel = inactive ? 'deactivated' : 'activated';
    return success(res, `Admin account ${statusLabel} successfully`, {
      adminId: parseInt(id),
      inactive: admin.inactive,
    });
  } catch (error) {
    console.error('[SUPER ADMIN TOGGLE ADMIN ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PATCH /admin/super/admins/:id/reset-password ────────────────────────────
/**
 * Super admin resets an admin's password directly.
 * Body: { new_password: "..." }
 */
module.exports.resetAdminPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password, user } = req.body;

    const admin = await User.findByPk(id, { include: [userWithRole] });
    if (!admin) return notFound(res, 'Admin account not found');

    const roleName = admin.role?.name?.toLowerCase();
    if (roleName !== 'admin') return badRequest(res, 'Can only reset password for admin accounts via this endpoint');

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await admin.update({ password: hashedPassword, updated_on: new Date(), updated_by: user?.id || null });

    return success(res, 'Admin password reset successfully', { adminId: parseInt(id) });
  } catch (error) {
    console.error('[SUPER ADMIN RESET PASSWORD ERROR]', error);
    return serverError(res, error);
  }
};

// ─── DELETE /admin/super/admins/:id ───────────────────────────────────────────
/**
 * Soft delete an admin account (marks as inactive + inactive flag)
 */
module.exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req.body;

    if (user?.id && parseInt(id) === parseInt(user.id)) {
      return badRequest(res, 'You cannot delete your own account');
    }

    const admin = await User.findByPk(id, { include: [userWithRole] });
    if (!admin) return notFound(res, 'Admin account not found');

    const roleName = admin.role?.name?.toLowerCase();
    if (roleName !== 'admin') return badRequest(res, 'Can only delete admin accounts via this endpoint');

    await admin.update({ inactive: true, updated_on: new Date(), updated_by: user?.id || null });

    return success(res, 'Admin account deleted successfully', { adminId: parseInt(id) });
  } catch (error) {
    console.error('[SUPER ADMIN DELETE ADMIN ERROR]', error);
    return serverError(res, error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT (super_admin only)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GET /admin/super/users ───────────────────────────────────────────────────
/**
 * List all regular users.
 * Query: ?search=, ?is_verified=, ?inactive=
 */
module.exports.getAllUsers = async (req, res) => {
  try {
    const { search, is_verified, inactive } = req.query;

    const userRole = await Reference.findOne({ where: { name: 'user' } });
    if (!userRole) return serverError(res, new Error('User role not found'));

    const where = { role_id: userRole.id };
    if (is_verified !== undefined) where.is_verified = is_verified === 'true';
    if (inactive !== undefined) where.inactive = inactive === 'true';

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      attributes: safeAttributes,
      include: [userWithRole],
      order: [['created_on', 'DESC']],
    });

    return success(res, 'Users fetched successfully', {
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('[SUPER ADMIN GET ALL USERS ERROR]', error);
    return serverError(res, error);
  }
};

// ─── GET /admin/super/users/:id ───────────────────────────────────────────────
/**
 * Get a single user by ID
 */
module.exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userRole = await Reference.findOne({ where: { name: 'user' } });

    const userRecord = await User.findOne({
      where: { id, role_id: userRole?.id },
      attributes: safeAttributes,
      include: [userWithRole],
    });

    if (!userRecord) return notFound(res, 'User not found');

    return success(res, 'User fetched successfully', userRecord);
  } catch (error) {
    console.error('[SUPER ADMIN GET USER BY ID ERROR]', error);
    return serverError(res, error);
  }
};

// ─── PATCH /admin/super/users/:id/toggle ──────────────────────────────────────
/**
 * Activate or deactivate a user account.
 * Body: { inactive: true|false }
 */
module.exports.toggleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { inactive, user } = req.body;

    const userRole = await Reference.findOne({ where: { name: 'user' } });

    const userRecord = await User.findOne({
      where: { id, role_id: userRole?.id },
      include: [userWithRole],
    });
    if (!userRecord) return notFound(res, 'User not found');

    await userRecord.update({ inactive, updated_on: new Date(), updated_by: user?.id || null });

    const statusLabel = inactive ? 'deactivated' : 'activated';
    return success(res, `User account ${statusLabel} successfully`, {
      userId: parseInt(id),
      inactive: userRecord.inactive,
    });
  } catch (error) {
    console.error('[SUPER ADMIN TOGGLE USER ERROR]', error);
    return serverError(res, error);
  }
};
