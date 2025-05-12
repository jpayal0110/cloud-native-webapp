const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config'); // Ensure this file has DB credentials
const FileMetadata = require('../models/fileMetadata'); // Ensure this model is defined correctly
const HealthCheck = require('../models/HealthChecks');
const logger = require('../logger'); // Import logger


// Initialize Sequelize connection
const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASSWORD, {
  host: config.DB_HOST,
  dialect: config.dialect,
  logging: false,
  define: {
    freezeTableName: true, // Prevent Sequelize from pluralizing table names
  }
});

// Test database connection
sequelize.authenticate()
  .then(() => logger.info('Database connection has been established successfully.'))
  .catch(error => logger.error('Unable to connect to the database:', error));

// Initialize Models
const models = {
  HealthCheck: HealthCheck(sequelize, DataTypes),
  FileMetadata: FileMetadata(sequelize, DataTypes), // Pass sequelize and DataTypes here
};

// Sync the database (ensure tables exist)
sequelize.sync({ alter: true })
  .then(() => logger.info('Database synced successfully.'))
  .catch(err => logger.error('Database sync error:', err));
// Export the sequelize instance & models
module.exports = { sequelize, models };
