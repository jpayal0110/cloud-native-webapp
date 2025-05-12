const express = require('express');
const request = require('supertest');
const app = require('../app')
const healthCheckRoutes = require('../routes/healthCheckRoutes');  // Import your routes
const { initializeHealthCheckTable } = require('../controllers/healthCheckController');  // Import the initialization method

describe("Health Check API Tests", () => {
    let app;

    // Initialize app before tests
    beforeAll(async () => {
        app = express();
        app.use(express.json());  // Use the necessary middlewares
        app.use(healthCheckRoutes);  // Use your routes

        // Initialize the health check table
        await initializeHealthCheckTable();
    });

    it("should return 200 for GET /healthz", async () => {
        const response = await request(app).get("/healthz");
        expect(response.statusCode).toBe(200);
    });

    it("should return 400 for GET /healthz with payload", async () => {
        const payload = {
            status: "down"
        };
    
        const response = await request(app)
            .get("/healthz")
            .send(payload);  // Sending the payload
    
        expect(response.statusCode).toBe(400);  // Expecting a 400 status code
    });
    

    it("should return 405 for POST /healthz", async () => {
        const response = await request(app).post("/healthz");
        expect(response.statusCode).toBe(405);
    });

    it("should return 405 for PUT /healthz", async () => {
        const response = await request(app).put("/healthz");
        expect(response.statusCode).toBe(405);
    });

    it("should return 405 for DELETE /healthz", async () => {
        const response = await request(app).delete("/healthz");
        expect(response.statusCode).toBe(405);
    });
});
