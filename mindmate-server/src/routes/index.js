const express = require("express");
const healthRouter = require("./health.routes");
const expertsRouter = require("./experts.routes");

const router = express.Router();

router.use("/health", healthRouter);
router.use("/experts", expertsRouter);

module.exports = router;
