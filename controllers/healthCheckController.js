const mysql = require('mysql2');
const { HealthCheck, sequelize } = require('../models');
const dbConfig = require('../config/config'); // Sequelize configuration file (contains db credentials)
const { Sequelize } = require('sequelize');
const statsd = require('hot-shots'); // Ensure this is correctly imported
const statsdClient = new statsd({ host: "localhost", port: 8125 });
const logger = require('../logger'); // Import logger


// Function to create database if it doesn't exist
const createDatabaseIfNotExist = () => {

  // Create a MySQL connection to check if the database exists
  const connection = mysql.createConnection({
    host: dbConfig.DB_HOST,
    user: dbConfig.DB_USER,
    password: dbConfig.DB_PASSWORD,
  });

  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        logger.error('❌ Error connecting to MySQL server:', err);
        reject(new Error('❌ Error connecting to MySQL server: ' + err));
      } else {
        logger.info('✅ Connected to MySQL server.');
        connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.DB_NAME}\`;`, (err, result) => {
          if (err) {
            logger.error('❌ Error creating database:', err);
            reject(new Error('❌ Error creating database: ' + err));
          } else {
            logger.info('⚡ Database checked/created:', dbConfig.DB_NAME);
            connection.end();
            resolve(); // Proceed with the next step after the database is created
          }
        });
      }
    });
  });
};

const healthCheckController = {

  initializeHealthCheckTable: async () => {
    try {
      // Step 1: Ensure the database exists first
      await createDatabaseIfNotExist();
      const syncStart = Date.now(); // Start timing DB sync
      await sequelize.sync({ alter: true });
      const syncDuration = Date.now() - syncStart; // Calculate execution time
      statsdClient.timing("db.sync.execution_time", syncDuration);
      logger.info(`DB Sync Execution Time: ${syncDuration}ms`);

      const countStart = Date.now(); // Start timing count query
      const count = await HealthCheck.count();
      const countDuration = Date.now() - countStart;
      statsdClient.timing("db.query.execution_time.healthCheckCount", countDuration);
      logger.info(`DB Count Query Execution Time: ${countDuration}ms`);

      if (count === 0) {
        const insertStart = Date.now();
        await HealthCheck.create({ datetime: new Date() });
        const insertDuration = Date.now() - insertStart;
        statsdClient.timing("db.query.execution_time.healthCheckInsert", insertDuration);
        logger.info(`DB Insert Query Execution Time: ${insertDuration}ms`);
      }
    } catch (error) {
      console.error('❌ Error initializing HealthChecks table:', error);
    }
  },

  checkHealth: async (req, res) => {
    if (req.headers['content-length'] > 0 || Object.keys(req.body).length > 0 || Object.keys(req.query).length > 0) {
      return res.status(400)
        .set({
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
          'Content-Type': 'application/json'
        }).send(); // Send an empty JSON object
    }
    if (req.method !== 'GET') {
      return res.status(405).set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Content-Type': 'application/json'
      }).send();
    }

    const queryStart = Date.now(); // Start timing the DB query

    try {
      await HealthCheck.create({ datetime: new Date() });
      const queryDuration = Date.now() - queryStart; // Calculate execution time
      statsdClient.timing("db.query.execution_time.healthCheck", queryDuration);
      logger.info(`DB Query Execution Time: ${queryDuration}ms`);

      res.status(200).set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Content-Type': 'application/json'
      }).send();
    } catch (error) {
      console.error('❌ Health Check Error:', error);
      res.status(503).set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Content-Type': 'application/json'
      }).send();
    }
  },
};

module.exports = healthCheckController;
