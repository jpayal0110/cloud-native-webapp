# Web Application 

## Prerequisites

Demo!

Before running this application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.x or later)
- [MySQL](https://www.mysql.com/) (v5.7 or later)

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/CSYE-6225-Cloud-Comptuting/webapp.git
cd healthcheck-app
```

### 2. Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

This will install:
- Express
- Sequelize and mysql2
- dotenv for environment variable management

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=healthcheck_db
```

Replace the `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` values with your MySQL configurations.

### 4. Initialize the Database & Run the Application

You need to ensure that the database is created and the models are synced. The application will automatically create the database if it does not exist when you start it.

Run the application to initialize:

```bash
npm start
```

### 7. Test the Application

Once the application is running, you can test the health check endpoint by making a GET request to:

```bash
http://localhost:3000/healthz
```