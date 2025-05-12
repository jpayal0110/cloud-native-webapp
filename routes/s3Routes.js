const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const s3Controller = require("../controllers/s3Controller");
const statsd = require("hot-shots");
const logger = require("../logger");
const statsdClient = new statsd({ host: "localhost", port: 8125 });

router.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const method = req.method;
    const route = req.route ? req.route.path : "unknown";

    statsdClient.increment(`api.calls.${method}.${route}`);
    statsdClient.timing(`api.response_time.${method}.${route}`, duration);

    logger.info(`API Call: ${method} ${route} - ${duration}ms`);
  });

  next();
});

router.post("/v1/file", upload.single("file"), s3Controller.uploadFile);
router.get("/v1/file/:key", s3Controller.getFile);
router.delete("/v1/file/:key", s3Controller.deleteFile);

module.exports = router;
