require('dotenv').config();  // Make sure to load environment variables
const { sequelize, models } = require('./db');  // Import sequelize and models from db.js

// Now you can access models directly
const HealthCheck = models.HealthCheck;  // Example: Accessing HealthCheck model
const FileMetadata = models.FileMetadata;
module.exports = {
  sequelize, // Export sequelize instance if needed elsewhere
  HealthCheck ,// Export model
  FileMetadata
};
