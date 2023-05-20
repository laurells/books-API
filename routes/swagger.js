// This code defines a router in a Node.js application using the Express framework.

// Import the necessary modules
const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Define the route for the Swagger API documentation

// Use the '/api-docs' endpoint to serve the Swagger UI
router.use('/api-docs', swaggerUi.serve);

// Handle GET requests to the '/api-docs' endpoint and set up the Swagger UI using the provided swaggerDocument
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

// Export the router object to be used by other modules
module.exports = router;