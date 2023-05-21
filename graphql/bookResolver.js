const { Book } = require('../models/book');
const { createRandomBook } = require('../controller/bookController');
// const connectDB = require('../database/db');

const resolvers = {
    Query: {
        books: async () => {
            try {
                // await connectDB.connect();
                // const db = connectDB.getDb().db('Book-Manager'); // Replace with your database name
                // const books = await db.collection('books').find().toArray();
                const books = await Book.find();
                return books;
            } catch (error) {
                console.error('Error retrieving books', error);
                throw new Error('An error occurred while retrieving the books');
            }
        },
        book: async (_, { id }) => {
            try {
                const book = await Book.findById(id);
                return book;
            } catch (error) {
                console.error('Error retrieving book', error);
                throw error;
            }
        },
    },
    Mutation: {
        createBook: async (_, { title, author, publicationYear, genre, isbn }) => {
            try {
                const book = new Book({ title, author, publicationYear, genre, isbn });
                const newBook = await book.save();
                return newBook;
            } catch (error) {
                console.error('Error creating book', error);
                throw error;
            }
        },
        updateBook: async (_, { id, title, author, publicationYear, genre, isbn }) => {
            try {
                const updatedBook = await Book.findByIdAndUpdate(
                    id,
                    { title, author, publicationYear, genre, isbn },
                    { new: true }
                );
                return updatedBook;
            } catch (error) {
                console.error('Error updating book', error);
                throw error;
            }
        },
        deleteBook: async (_, { id }) => {
            try {
                const deletedBook = await Book.findByIdAndDelete(id);
                return deletedBook;
            } catch (error) {
                console.error('Error deleting book', error);
                throw error;
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
    },
};

module.exports = resolvers;
