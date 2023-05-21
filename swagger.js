// Import the necessary module
const swaggerAutogen = require('swagger-autogen')();

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Book Management API',
        version: '1.0.0',
        description: 'API documentation for the Book Management API',
      },
    },
    host: 'codewithrels.onrender.com', // Specify the host where the API is running
    schemes: ['https'], // Specify the schemes used for the API (e.g., http, https)
  };


// Specify the output file path for the generated Swagger JSON file
const outputFile = './swagger.json';

// Specify the file(s) that define the API endpoints
const endpointFile = ['./routes/index.js'];

// Generate the Swagger JSON file
swaggerAutogen(outputFile, endpointFile, swaggerOptions);