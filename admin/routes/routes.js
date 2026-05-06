const express = require("express");
const router = express.Router();

// ─── Auth Routes ──────────────────────────────────────────────────────────────
const authRouter = require("./auth.route");
router.use("/auth", authRouter);

// ─── Menu, Feedback, Orders, Analytics, Location Routes ──────────────────────
const menuRouter = require("./menu.route");
router.use("/", menuRouter);

// ─── Super Admin Routes ───────────────────────────────────────────────────────
const superAdminRouter = require("./superAdmin.route");
router.use("/super", superAdminRouter);

module.exports = router;