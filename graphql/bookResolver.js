const Book = require('../models/book');
const { createRandomBook } = require('../controller/bookController');
const connectDB = require('../database/db');
const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
// const { ObjectId } = require('mongodb');

const resolvers = {
    Query: {
        books: async () => {
            try {
                const db = connectDB.getDb().db('Book-Manager'); // Replace with your database name
                const books = await db.collection('books').find().toArray();
                return books;
            } catch (error) {
                console.error('Error retrieving books', error);
                throw error;
            }
        },
        book: async (_, { id }) => {
            try {
                const db = connectDB.getDb().db('Book-Manager'); // Replace with your database name
                const book = await db.collection('books').find({ id }).toArray();
                return book;
            } catch (error) {
                console.error('Error retrieving book', error);
                throw error;
            }
        },
        isAuthorized: async (_, __, { req }) => {
            try {
                if (req.oidc.isAuthenticated()) {
                    return true;
                } else {
                    return false;
                }
            } catch (err) {
                throw new Error(err.message);
            }
        },
    },
    Mutation: {
        createBook: async (parent, { title, author, publicationYear, genre, isbn }) => {
            console.log('Input:', { title, author, publicationYear, genre, isbn });
            
            // Validate the input data
            if (!title || !author || !publicationYear || !genre || !isbn) {
              console.error('Incomplete book information');
              throw new Error('Incomplete book information');
            }
          
            try {
              // Logic to create a new book in the database
              const book = new Book({ title, author, publicationYear, genre, isbn });
              console.log('New Book:', book);
          
              const newBook = await connectDB
                .getDb()
                .db('Book-Manager')
                .collection('books')
                .insertOne(book, { maxTimeMS: 30000 });
          
              console.log('Created Book:', newBook);
              return newBook;
            } catch (error) {
              console.error('Error creating book', error);
              throw new Error('Failed to create book');
            }
          },
        updateBook: async (parent, { id, title, author, publicationYear, genre, isbn }) => {
            // Validate the input data
            // If validation fails, throw an error with appropriate message
            if (!id) {
                throw new Error('Invalid book ID');
            }

            try {
                // Logic to update an existing book in the database
                const updatedBook = await Book.findByIdAndUpdate(
                    id,
                    { title, author, publicationYear, genre, isbn },
                    { new: true }
                );

                if (!updatedBook) {
                    throw new Error('Book not found');
                }

                return updatedBook;
            } catch (error) {
                console.error('Error updating book', error);
                throw new Error('Failed to update book');
            }
        },
        deleteBook: async (parent, { id }) => {
            try {
              const deletedBook = await connectDB
                .getDb()
                .db('Book-Manager')
                .collection('books')
                .findOneAndDelete({ _id: new ObjectId(id) }, { maxTimeMS: 60000 });
          
              if (!deletedBook.value) {
                console.error('Book not found');
                throw new Error('Book not found');
              }
          
              console.log('Deleted Book:', deletedBook.value);
              return deletedBook.value;
            } catch (error) {
              console.error('Error deleting book', error);
              throw new Error('Failed to delete book');
            }
          },
        createRandomBook: async (_, __, { req, res }) => {
            try {
                const book = await createRandomBook(req, res);
                return book;
            } catch (error) {
                console.error('Error creating random book', error);
                throw error;
            }
        },
        saveUserData: async (_, __, { req }) => {
            try {
                // Validate user authentication
                if (!req.oidc.isAuthenticated()) {
                    throw new Error('Not authorized to check user status - please log in');
                }

                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    throw new Error(JSON.stringify(errors.array()));
                }

                const user_data = {
                    user_id: req.oidc.user.sub,
                    user_name: req.oidc.user.name,
                };

                const alreadyExists = await connectDB
                    .getDb()
                    .db('Book-Manager')
                    .collection('user_data')
                    .findOne(user_data);

                if (alreadyExists) {
                    return user_data;
                }

                // if user didn't already exist, add user info to the database
                const response = await connectDB
                    .getDb()
                    .db('Book-Manager')
                    .collection('user_data')
                    .insertOne(user_data);

                if (response.acknowledged) {
                    return user_data;
                } else {
                    throw new Error(response.error || 'Some error occurred while adding a new user to the db.');
                }
            } catch (err) {
                throw new Error(err.message);
            }
        },
    },
};

module.exports = resolvers;