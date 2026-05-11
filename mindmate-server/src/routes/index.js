const express = require("express");
const healthRouter = require("./health.routes");
const expertsRouter = require("./experts.routes");
const authRouter = require("./auth.routes");

const router = express.Router();

router.use("/health", healthRouter);
router.use("/experts", expertsRouter);
router.use("/auth", authRouter);

module.exports = router;
