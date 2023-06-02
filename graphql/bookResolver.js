// Import necessary modules and dependencies
const Book = require('../models/book');
// const { createRandomBook } = require('../controller/bookController');
const connectDB = require('../database/db');
const { validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const { ApolloError } = require("apollo-server-express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Define the resolvers object
const resolvers = {
    Query: {
        // Resolver for the 'books' query
        books: async () => {
            try {
                // Connect to the database and retrieve all books
                const db = connectDB.getDb().db('Book-Manager'); // Replace with your database name
                const books = await db.collection('books').find().toArray();
                // Convert the MongoDB _id to a string and assign it to the id field for each book
                const booksWithIdAsString = books.map(book => {
                    book.id = book._id.toString();
                    return book;
                });

                return booksWithIdAsString;

            } catch (error) {
                console.error('Error retrieving books', error);
                throw error;
            }
        },

        // Resolver for the 'book' query
        book: async (_, { id }) => {
            try {
                // Connect to the database and find a book by its ID
                const db = connectDB.getDb().db('Book-Manager'); // Replace with your database name
                const book = await db.collection('books').findOne({ _id: new ObjectId(id) });
                if (!book) {
                    throw new Error(`Book with ID ${id} not found`);
                }
                // Transform the MongoDB _id to a string and assign it to the id field
                book.id = book._id.toString();
                return book;
            } catch (error) {
                console.error('Error retrieving book', error);
                throw error;
            }
        },

        // Resolver for the 'isAuthorized' query
        isAuthorized: async (_, __, { req }) => {
            try {
                // Check if the user is authenticated
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
        // Resolver for the 'createBook' mutation
        createBook: async (parent, { title, author, publicationYear, genre, isbn }, { res }) => {
            console.log('Input:', { title, author, publicationYear, genre, isbn });

            // Validate the input data
            if (!title || !author || !publicationYear || !genre || !isbn) {
                res.status(400); // Bad Request
                throw new ApolloError('Incomplete book information', 'BAD_REQUEST');
            }
            // Perform validation
            if (!title) {
                throw new Error('Title is required');
            }

            if (!author) {
                throw new Error('Author is required');
            }

            if (!publicationYear || publicationYear < 0) {
                throw new Error('Invalid publication year');
            }

            try {
                // Create a new book in the database
                const book = new Book({ title, author, publicationYear, genre, isbn });
                console.log('New Book:', book);

                const newBook = await connectDB
                    .getDb()
                    .db('Book-Manager')
                    .collection('books')
                    .insertOne(book, { maxTimeMS: 30000 });

                res.status(201); // Created
                // Set the id field and return the created book
                book.id = newBook.insertedId.toString();
                return book;
            } catch (error) {
                console.error('Error creating book', error);
                res.status(500); // Internal Server Error
                throw new ApolloError('Failed to create book', 'INTERNAL_SERVER_ERROR');
            }
        },

        // Resolver for the 'updateBook' mutation
        updateBook: async (parent, { id, title, author, publicationYear, genre, isbn }, { res }) => {
            // Validate the input data

            if (!id) {
                res.status(400); // Bad Request
                throw new ApolloError('Invalid book ID', 'BAD_REQUEST');
            }

            try {
                // Update an existing book in the database
                const updatedBook = await Book.findByIdAndUpdate(
                    id,
                    { title, author, publicationYear, genre, isbn },
                    { new: true, timeout: 15000 }
                );

                if (!updatedBook) {
                    res.status(404); // Not Found
                    throw new ApolloError('Book not found', 'NOT_FOUND');
                }
                res.status(200); // OK
                return updatedBook;
            } catch (error) {
                console.error('Error updating book', error);
                res.status(500); // Internal Server Error
                throw new ApolloError('Failed to update book');
            }
        },

        // Resolver for the 'deleteBook' mutation
        deleteBook: async (parent, { id }, { res }) => {
            try {
                if (!res) {
                    throw new Error("Response object not found");
                }
                // Delete a book from the database
                const deletedBook = await connectDB
                    .getDb()
                    .db('Book-Manager')
                    .collection('books')
                    .findOneAndDelete({ _id: new ObjectId(id) }, { maxTimeMS: 30000 });

                if (!deletedBook.value) {
                    res.status(404); // Not Found
                    throw new ApolloError('Book not found', 'NOT_FOUND');
                }

                res.status(200); // OK
                console.log('Deleted Book:', deletedBook.value);

                // Set the id field and return the deleted book
                deletedBook.value.id = deletedBook.value._id.toString();
                return deletedBook.value;
            } catch (error) {
                console.error('Error deleting book', error);
                res.status(500); // Internal Server Error
                throw new ApolloError('Failed to delete book', 'INTERNAL_SERVER_ERROR');
            }
        },

        // Resolver for the 'createRandomBook' mutation
        // createRandomBook: async (_, __, { req, res }) => {
        //     try {
        //         // Create a random book using the bookController's createRandomBook function
        //         const book = await createRandomBook(req, res);
        //         return book;
        //     } catch (error) {
        //         console.error('Error creating random book', error);
        //         throw error;
        //     }
        // },

        // Resolver for the 'saveUserData' mutation
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

                // If the user doesn't already exist, add user info to the database
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

        registerUser: async (_, { username, password }) => {
            try {
              // Check if the user already exists
              const existingUser = await User.findOne({ username });
              if (existingUser) {
                throw new Error('Username already exists');
              }
          
              // Hash the password
              const hashedPassword = await bcrypt.hash(password, 10);
          
              // Create a new user
              const user = new User({
                username,
                password: hashedPassword,
              });
          
              // Save the user to the database
              await user.save();
          
              // Return the newly created user
              return user;
            } catch (error) {
              console.error('Error registering user:', error);
              throw new Error(error.message);
            }
          },

          loginUser: async (_, { username, password }) => {
            try {
              // Find the user by username
              const user = await User.findOne({ username });
              if (!user) {
                throw new Error('Invalid username or password');
              }
      
              // Compare the provided password with the hashed password in the database
              const isPasswordValid = await bcrypt.compare(password, user.password);
              if (!isPasswordValid) {
                throw new Error('Invalid username or password');
              }
      
              // Generate a JSON Web Token (JWT) for authentication
              const token = jwt.sign({ userId: user.id }, 'your_secret_key', { expiresIn: '1h' });
      
              // Return the token
              return { token };
            } catch (error) {
              throw new Error(error.message);
            }
          },
    },
};

// Export the resolvers object
module.exports = resolvers;
