module.exports = (sequelize, DataTypes) => {
  const FileMetadata = sequelize.define('FileMetadata', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,  // The ID is the primary key
    },
    file_name: {
      type: DataTypes.STRING,  // Store the original file name
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,  // Store the URL/path to the file in S3
      allowNull: false,
    },
    upload_date: {
      type: DataTypes.DATEONLY,  // Store the date the file was uploaded
      defaultValue: DataTypes.NOW,  // Default to current date
    },
  },
    {
      timestamps: false
    }
  );

  return FileMetadata;
};
