// This code exports a module that provides a simple interface for connecting to a MongoDB database using the official MongoDB driver for Node.js.

// Import the 'dotenv' package and call its 'config' method, which loads environment variables from a .env file into the process.env object.
const dotenv = require('dotenv');
dotenv.config();

// Import the MongoClient from the 'mongodb' package.
const MongoClient = require('mongodb').MongoClient;

// Get the MongoDB connection URI from the environment variable.
const uri = process.env.MONGODB_URI;

// Variable to store the initialized MongoDB client.
let _db;

// Function to connect to the MongoDB database.
const connectDB = (callback) => {
  // If the database is already initialized, return it.
  if (_db) {
    console.log('Db is already initialized!');
    return callback(null, _db);
  }

  // If the MongoDB URI is not defined, return an error.
  if (!uri) {
    console.log('MONGODB_URI is not defined in .env');
    return callback('Missing environment variable MONGODB_URI');
  }

  // Connect to the MongoDB database using the MongoClient.
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      _db = client;
      callback(null, _db);
    })
    .catch(err => {
      callback(err);
    });
};

// Function to get the initialized MongoDB client.
const getDb = () => {
  // If the database is not initialized, throw an error.
  if (!_db) {
    throw Error('Db not initialized');
  }
  return _db;
};

// Export the connectDB and getDb functions as properties of the module.
module.exports = {
  connectDB,
  getDb
};
