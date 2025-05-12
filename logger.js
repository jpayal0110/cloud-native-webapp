const winston = require('winston');
const WinstonCloudWatch = require('winston-cloudwatch');

// // Set up the CloudWatch transport
// const cloudWatchTransport = new WinstonCloudWatch({
//   logGroupName: '/aws/ec2/csye6255-logs',     // Set your CloudWatch log group name
//   logStreamName: '{instance_id}',   // Set your CloudWatch log stream name
//   awsRegion: 'us-east-1',                  // Specify your AWS region
//   jsonMessage: true                        // Optional: If you want logs to be JSON formatted
// });

// Create a Winston logger instance
const logger = winston.createLogger({
  level: 'info',                           // Set the default logging level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({        // Log to console (optional)
      format: winston.format.simple(),
    }),
    // cloudWatchTransport                      // Log to CloudWatch
  ]
});

module.exports = logger;
