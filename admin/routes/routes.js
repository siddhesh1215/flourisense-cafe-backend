const express = require("express");
const router = express.Router();

// ─── Auth Routes ──────────────────────────────────────────────────────────────
const authRouter = require("./auth.route");
router.use("/auth", authRouter);

// ─── Menu & Feedback Routes ───────────────────────────────────────────────────
const menuRouter = require("./menu.route");
router.use("/", menuRouter);

module.exports = router;