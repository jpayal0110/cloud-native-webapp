// routes/healthCheckRoutes.js
const express = require('express');
const router = express.Router();
const healthCheckController = require('../controllers/healthCheckController');
const statsd = require("hot-shots"); // Import StatsD for CloudWatch Metrics
const logger = require('../logger');
const statsdClient = new statsd({ host: "localhost", port: 8125 }); // StatsD Client

// Middleware to track health check API metrics
router.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    const method = req.method;
    const route = req.route ? req.route.path : req.originalUrl || req.url;
        
    // Count the number of calls to health check
    statsdClient.increment(`healthcheck.calls.${method}.${route}`);
    
    // Track the response time for the health check
    statsdClient.timing(`healthcheck.response_time.${method}.${route}`, duration);
    
    // Log the operation and response time
    logger.info(`Health Check: ${method} ${route} - ${duration}ms`);
  });

  next();
});

// Define the /healthz route
router.get('/healthz', healthCheckController.checkHealth);
router.post('/healthz', healthCheckController.checkHealth);
router.put('/healthz', healthCheckController.checkHealth);
router.head('/healthz', healthCheckController.checkHealth);
router.options('/healthz', healthCheckController.checkHealth);
router.patch('/healthz', healthCheckController.checkHealth);
router.delete('/healthz', healthCheckController.checkHealth);
router.get('/cicd', healthCheckController.checkHealth);



module.exports = router;
