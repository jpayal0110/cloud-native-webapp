# Cloud-Native Web Application

This project is a cloud-native Node.js web application designed for modern deployment using AWS infrastructure, GitHub Actions for CI/CD, and monitoring via CloudWatch. It supports core features like health check APIs, secure file uploads to S3, and structured logging.


## Features

- RESTful API with Express.js
- Health check endpoint (`/healthz`)
- File upload to Amazon S3 with metadata logging
- Secure access with Secrets Manager and IAM roles
- Structured logging with Winston and CloudWatch
- Systemd service integration for auto-start on EC2
- Automated builds with Packer
- GitHub Actions workflows for CI/CD and validation

## Deployment

### Prerequisites

- AWS CLI configured
- EC2 instance with appropriate IAM role
- S3 bucket created
- Secrets stored in AWS Secrets Manager
- MySQL or PostgreSQL RDS instance (if used)
- Node.js and npm installed

### Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment config in `config/config.js`
4. Run the app:
   ```
   node app.js
   ```
5. Use `csye6225.service` to run as a systemd service on startup.

## CI/CD

- GitHub Actions:
  - `webapp.yml` – main CI pipeline
  - `packer-check.yml` – template validation
  - `packer-build.yml` – image creation and deployment


