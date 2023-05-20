// Import the necessary modules
const express = require('express');
const router = express.Router();

// Use the './swagger' module to handle requests to the root endpoint '/'
router.use('/', require('./swagger'));

// Use the './contacts' module to handle requests to the '/contact' endpoint
router.use('/books', require('./book'));

// Use the './contact-generator' module to handle requests to the '/contact-generator' endpoint
router.use('/book-generator', require('./books-generator'));

// Export the router object to be used by other modules
module.exports = router;