const Book = require('../models/book');
const connectDB = require('../database/db');
const { ObjectId } = require('mongodb');
const { ApolloError, AuthenticationError, AuthorizationError } = require("apollo-server-express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const dotenv = require('dotenv');
dotenv.config();

const resolvers = {
  Query: {
    books: async (_, __, { isAuth }) => {
      try {
        // Check if the user is authenticated
        if (!isAuth) {
          throw new AuthenticationError('Unauthorized');
        }

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
        throw new ApolloError('Failed to retrieve books. Database connection failed', 'BOOKS_RETRIEVAL_ERROR');
      }
    },

    book: async (_, { id }, { isAuth }) => {
      try {
        // Check if the user is authenticated
        if (!isAuth) {
          throw new AuthenticationError('Unauthorized');
        }

        // Connect to the database and find a book by its ID
        const db = connectDB.getDb().db('Book-Manager'); 
        const book = await db.collection('books').findOne({ _id: new ObjectId(id) });

        if (!book) {
          throw new ApolloError(`Book with ID ${id} not found`, 'BOOK_NOT_FOUND');
        }

        // Transform the MongoDB _id to a string and assign it to the id field
        book.id = book._id.toString();
        return book;
      } catch (error) {
        console.error('Error retrieving book', error);
        throw new ApolloError('Failed to retrieve book. Database connection failed', 'BOOK_RETRIEVAL_ERROR');
      }
    },

    isAuthorized: async (_, __, { isAuth }) => {
      try {
        // Check if the user is authenticated
        return !!isAuth;
      } catch (error) {
        console.error('Error checking authorization', error);
        throw new ApolloError('Failed to check authorization', 'AUTHORIZATION_ERROR');
      }
    },

    loginUser: async (_, { username, password }) => {
      try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
          throw new ApolloError('Invalid username or password', 'INVALID_CREDENTIALS');
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new ApolloError('Invalid username or password', 'INVALID_CREDENTIALS');
        }

        // Generate a JSON Web Token (JWT) for authentication
        const token = jwt.sign({ userId: user.id }, process.env.TOKEN, { expiresIn: '1h' });

        // Return the token
        return { token };
      } catch (error) {
        throw new ApolloError('Failed to log in. Database connection failed', 'LOGIN_ERROR');
      }
    },

    logout: async (_, __, { req }) => {
      if (!req.user) {
        return "Already logged out";
      }

      // Clear the session data
      req.session.destroy();

      return "Logged out successfully";
    },
  },

  Mutation: {
    createBook: async (_, { title, author, publicationYear, genre, isbn }, { isAuth }) => {
      try {
        // Check if the user is authenticated
        if (!isAuth) {
          throw new AuthenticationError('Unauthorized');
        }

        // Validate the input data
        if (!title || !author || !publicationYear || !genre || !isbn) {
          throw new ApolloError('Incomplete book information', 'BAD_REQUEST');
        }

        // Perform validation
        if (!title) {
          throw new ApolloError('Title is required', 'BAD_REQUEST');
        }

        if (!author) {
          throw new ApolloError('Author is required', 'BAD_REQUEST');
        }

        if (!publicationYear || publicationYear < 0) {
          throw new ApolloError('Invalid publication year', 'BAD_REQUEST');
        }

        // Create a new book in the database
        const book = new Book({ title, author, publicationYear, genre, isbn });
        const newBook = await connectDB.getDb().db('Book-Manager').collection('books').insertOne(book, { maxTimeMS: 30000 });

        // Set the id field and return the created book
        book.id = newBook.insertedId.toString();
        return book;
      } catch (error) {
        console.error('Error creating book', error);
        throw new ApolloError('Failed to create book. Database connection failed', 'BOOK_CREATION_ERROR');
      }
    },

    updateBook: async (_, { id, title, author, publicationYear, genre, isbn }, { user }) => {
      try {
        // Check if the user is authenticated
        if (!user) {
          throw new AuthenticationError('Unauthorized');
        }

        // Check if the user is authorized (admin or librarian)
        if (user.role !== 'admin') {
          throw new AuthorizationError('Not authorized to update a book');
        }

        // Validate the input data
        if (!id) {
          throw new ApolloError('Invalid book ID', 'BAD_REQUEST');
        }

        // Retrieve the existing book from the database
        const existingBook = await Book.findById(id);

        if (!existingBook) {
          throw new ApolloError('Book not found', 'NOT_FOUND');
        }

        // Update the book fields
        existingBook.title = title;
        existingBook.author = author;
        existingBook.publicationYear = publicationYear;
        existingBook.genre = genre;
        existingBook.isbn = isbn;

        // Save the updated book to the database
        const updatedBook = await existingBook.save();

        return updatedBook;
      } catch (error) {
        console.error('Error updating book', error);
        throw new ApolloError('Failed to update book. Database connection failed', 'BOOK_UPDATE_ERROR');
      }
    },


    deleteBook: async (_, { id }, { user }) => {
      try {
        // Check if the user is authenticated
        if (!user) {
          throw new AuthenticationError('Unauthorized');
        }

        if (!id) {
          throw new ApolloError('Invalid book ID', 'BAD_REQUEST');
        }

        // Delete a book from the database
        const deletedBook = await connectDB
          .getDb()
          .db('Book-Manager')
          .collection('books')
          .findOneAndDelete({ _id: new ObjectId(id) }, { maxTimeMS: 30000 });

        if (!deletedBook.value) {
          throw new ApolloError('Book not found', 'NOT_FOUND');
        }

        // Set the id field and return the deleted book
        deletedBook.value.id = deletedBook.value._id.toString();
        return deletedBook.value;
      } catch (error) {
        console.error('Error deleting book', error);
        throw new ApolloError('Failed to delete book. Database connection failed', 'BOOK_DELETION_ERROR');
      }
    },

    registerUser: async (_, { username, password, role }) => {
      try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new ApolloError('Username already exists', 'USERNAME_EXISTS');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        if (role !== 'admin' && role !== 'librarian') {
          throw new ApolloError('Invalid role', 'INVALID_ROLE');
        }

        // Create a new user
        const user = new User({
          username,
          password: hashedPassword,
          role,
        });

        // Save the user to the database
        await connectDB.getDb().db('User-Management').collection('user_collection').insertOne(user, { maxTimeMS: 30000 });

        return user;
      } catch (error) {
        console.error('Error registering user', error);
        throw new ApolloError('Failed to register user. Database connection failed', 'USER_REGISTRATION_ERROR');
      }
    },


    saveGoogleUser: async (_, { googleUser }) => {
      try {
        // Extract relevant information from the googleUser object
        const { googleId, email, firstName, lastName } = googleUser;

        // Check if the user already exists in the database
        let user = await User.findOne({ googleId });

        if (user) {
          // User already exists, update the user's details
          user.email = email;
          user.firstName = firstName;
          user.lastName = lastName;
        } else {
          // User doesn't exist, create a new user object
          user = new User({
            googleId,
            email,
            firstName,
            lastName,
          });
        }

        // Save the user object to the database
        await connectDB.getDb().db('User-Management').collection('user_collection').insertOne(user, { maxTimeMS: 30000 });

        // Return the saved user object
        return user;
      } catch (error) {
        console.error('Error saving Google user', error);
        throw new ApolloError('Failed to save Google user. Database connection failed', 'SAVE_USER_ERROR');
      }
    },
  },
};

module.exports = resolvers;
