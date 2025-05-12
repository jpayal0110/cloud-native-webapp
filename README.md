# Cloud-Native Web Application

This project is a cloud-native Node.js web application designed for modern deployment using AWS infrastructure, GitHub Actions for CI/CD, and monitoring via CloudWatch. It supports core features like health check APIs, secure file uploads to S3, and structured logging.

## For infra code checkout:  **[Terraform AWS Infrastructure](https://github.com/jpayal0110/terraform-aws-infra)**


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

## To run the app locally Pre-requisites

- Install latest Node.js. Verify the versions using below commands:
```
node -v
npm -v
```
- Install latest MYSQL
- Clone the repository using git command: git clone git@github.com:jpayal0110/cloud-native-webapp.git
- Navigate to webapp directory using git CLI (git bash): cd webapp
- Install dependencies (dotenv, express, sequelize, pg, pg-hstore, bcryptjs) using git command: npm install
- Create .env file and set below paramaters:
```
HOST=localhost
PORT=<db_server_port>
DATABASE=<database_name>
USER=<your_db_username>
DIALECT=postgres
PASSWORD=<your_db_password>
BCRYPT_SALT_ROUNDS=<no_of_salt_rounds>
```
- Run the app using command: npm run dev

### To create and AMI from packer template
- Install Packer and run below commands
```
packer init .
packer fmt .
packer validate .
packer build csye6225-aws.pkr.hcl
```

