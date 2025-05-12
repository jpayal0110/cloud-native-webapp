const AWS = require("aws-sdk");
const uuid = require("uuid");
const { FileMetadata } = require("../models");
const logger = require("../logger");
require("dotenv").config();

// Initialize CloudWatch
const cloudwatch = new AWS.CloudWatch({ region: process.env.AWS_REGION });

// AWS S3 Configuration
const s3 = new AWS.S3({ region: process.env.AWS_REGION });

const putMetric = async (metricName, value) => {
  try {
    await cloudwatch.putMetricData({
      Namespace: "Webbapp",
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: "Milliseconds",
          Timestamp: new Date(),
        },
      ],
    }).promise();
  } catch (err) {
    console.error(`Failed to send ${metricName} to CloudWatch:`, err);
  }
};

// Upload File to S3 and Save Metadata in DB
exports.uploadFile = async (req, res) => {
  const start = Date.now();
  await putMetric("API_Invocation_UploadFile", 1); // Track API calls

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const file = req.file;
    const fileName = file.originalname;
    logger.info(file.buffer);

    const id = uuid.v4();
    const objectKey = `${id}/${fileName}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    // Upload to S3
    const s3UploadStart = Date.now();
    const s3Upload = await s3.upload(params).promise();
    const s3UploadDuration = Date.now() - s3UploadStart;
    await putMetric("S3_UploadTime_UploadFile", s3UploadDuration);

    // Save metadata to DB
    const dbQueryStart = Date.now();
    const fileMetadata = await FileMetadata.create({
      id: id,
      file_name: fileName,
      url: `${process.env.S3_BUCKET_NAME}/${objectKey}`,
      upload_date: new Date(),
    });
    const dbQueryDuration = Date.now() - dbQueryStart;
    await putMetric("DB_QueryTime_UploadFile", dbQueryDuration);

    // API Response Time
    await putMetric("API_ResponseTime_UploadFile", Date.now() - start);

    res.status(201).json(fileMetadata.dataValues);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "File upload failed" });
  }
};

// Get File from S3 and Stream to Response
exports.getFile = async (req, res) => {
  const start = Date.now();
  await putMetric("API_Invocation_GetFile", 1);

  try {
    const { key } = req.params;

    // Fetch file metadata from the database
    const dbQueryStart = Date.now();
    const result = await FileMetadata.findByPk(key);
    const dbQueryDuration = Date.now() - dbQueryStart;
    await putMetric("DB_QueryTime_GetFile", dbQueryDuration);

    const fileInfo = result?.dataValues ?? null;

    if (!fileInfo) {
      res.status(404).end();
    }

    // Download from S3
    const s3DownloadStart = Date.now();
    const s3Object = await s3.getObject({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${key}/${result.file_name}`,
    }).promise();

    const s3DownloadDuration = Date.now() - s3DownloadStart;
    await putMetric("S3_DownloadTime_GetFile", s3DownloadDuration);

    // API Response Time
    await putMetric("API_ResponseTime_GetFile", Date.now() - start);

    res.send(fileInfo);
  } catch (error) {
    logger.log(error);
    res.status(503).end();
  }
};

// Delete file from S3 and remove metadata from the database
exports.deleteFile = async (req, res) => {
  const start = Date.now();
  await putMetric("API_Invocation_DeleteFile", 1);

  try {
    const { key: fileId } = req.params;

    // Fetch metadata from the database
    const dbQueryStart = Date.now();
    const fileMetadata = await FileMetadata.findOne({ where: { id: fileId } });
    const dbQueryDuration = Date.now() - dbQueryStart;
    await putMetric("DB_QueryTime_DeleteFile", dbQueryDuration);

    if (!fileMetadata) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const objectKey = `${fileId}/${fileMetadata.file_name}`;

    // Delete file from S3
    const s3DeleteStart = Date.now();
    await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: objectKey }).promise();
    const s3DeleteDuration = Date.now() - s3DeleteStart;
    await putMetric("S3_DeleteTime_DeleteFile", s3DeleteDuration);

    // Delete metadata from DB
    const dbDeleteStart = Date.now();
    await fileMetadata.destroy();
    const dbDeleteDuration = Date.now() - dbDeleteStart;
    await putMetric("DB_QueryTime_DeleteFile", dbDeleteDuration);

    // API Response Time
    await putMetric("API_ResponseTime_DeleteFile", Date.now() - start);

    res.status(204).end();
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(503).json({ success: false, message: "File deletion failed" });
  }
};
