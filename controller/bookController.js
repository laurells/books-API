const connectDB = require('../database/db');
// const { Request, Response } = require('express');
const { Book } = require('../models/book');
const faker = require('faker');

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving the books' });
  }
}; 

// Create a new book
const createBook = async (req, res) => {
  try {
    // Extract book data from the request body
    const { title, author, publicationYear, genre, isbn } = req.body;

    // Create a new instance of the Book model
    const book = new Book({
      title,
      author,
      publicationYear,
      genre,
      isbn,
    });

    // Save the book to the database
    const savedBook = await book.save();

    res.status(201).json(savedBook);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the book' });
  }
};

// Get a book by ID
const getBookById = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Find the book by ID in the database
    const book = await Book.findById(bookId);

    if (!book) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.status(200).json(book);
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while retrieving the book' });
  }
};


// Update a book by ID
const updateBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Extract updated book data from the request body
    const { title, author, publicationYear, genre, isbn } = req.body;

    // Find the book by ID in the database and update its data
    const updatedBook = await Book.findByIdAndUpdate(bookId, { title, author, publicationYear, genre, isbn }, { new: true });

    if (!updatedBook) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.status(200).json(updatedBook);
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the book' });
  }
};


// Delete a book by ID
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;

    // Find the book by ID in the database and delete it
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      res.status(200).json({ message: 'Book deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the book' });
  }
};


const createRandomBook = async (req, res) => {
  try {
    // Generate random book data using faker library
    const book = {
      title: faker.random.words(3),
      author: faker.name.findName(),
      publicationYear: faker.random.number({ min: 1800, max: 2022 }),
      genre: faker.random.arrayElement([
        'Fiction',
        'Non-Fiction',
        'Science Fiction',
        'Mystery',
        'Fantasy',
      ]),
      isbn: faker.random.uuid(),
      // Add more properties as needed
    };

    // Insert the generated book into the database
    // const db = await connectDB();
    const response = await connectDB.getDb().db('Book-Manager').collection('books').insertOne(book);

    if (response.acknowledged) {
      // Book created successfully, send a response with the inserted document
      res.status(201).json(book);
    } else {
      // Error occurred while creating the book, send an error response
      throw new Error(response?.result?.errmsg || 'Encountered an error while creating a book');
    }
  } catch (err) {
    // Error occurred, send an error response
    res.status(500).json({ error: 'An error occurred while creating a random book' });
  }
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, createRandomBook };