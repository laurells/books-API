// Import the necessary modules
const express = require('express');
const router = express.Router();
const booksController = require('../controller/bookController');

// Define routes for handling contact-related requests

// GET all contacts
router.get('/', booksController.getAllBooks);

// GET a specific contact by ID
router.get('/:id', booksController.getBookById);

// POST request to create a new contact
router.post('/', booksController.createBook);
// Export the router object to be used by other modules
module.exports = router;