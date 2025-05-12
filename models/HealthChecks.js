
module.exports = (sequelize, DataTypes) => {
  const HealthCheck = sequelize.define('HealthCheck', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    datetime: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    tableName: 'HealthChecks', // Make sure this matches your actual table name
    timestamps: false
  });

  return HealthCheck;
};
