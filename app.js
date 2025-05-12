const express = require('express');
const StatsD = require("hot-shots"); // Import StatsD for CloudWatch Metrics
const app = express();
const healthCheckRoutes = require('./routes/healthCheckRoutes');
const { initializeHealthCheckTable } = require('./controllers/healthCheckController');
const s3Routes = require("./routes/s3Routes");
const logger = require('./logger');  // Import the logger

const statsd = new StatsD({ host: "localhost", port: 8125 });
const port = process.env.PORT || 8080; // Change 8080 to another port if needed

// Middleware to parse JSON body
app.use(express.json());

// Ensure database and table are initialized on startup
(async () => {
  try {
    await initializeHealthCheckTable();  // Initialize asynchronously
    logger.info("HealthCheck table initialized successfully");
  } catch (error) {
    logger.error(`Error initializing HealthCheck table: ${error.message}`);
    process.exit(1);  // Exit process on error (could be adjusted depending on requirements)
  }
})();

// Use the health check routes
app.use(healthCheckRoutes);

// Use S3 Routes under `/api/s3`
app.use(s3Routes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Error occurred: ${err.message}`);
  statsd.increment("api.errors"); // Track error count in CloudWatch
  res.status(500).json({ error: "Internal Server Error" });
});

// Log server startup
app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);  // Log with CloudWatch and console
});
