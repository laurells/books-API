//This code exports a module that provides a simple interface for connecting to a MongoDB database using the official MongoDB driver for Node.js.

//import the 'dotenv' package and call its 'config' method, which loads environment variables from a .env file into the process.env object.
const dotenv = require('dotenv');
dotenv.config();
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.MONGODB_URI;
let _db;

const connectDB = (callback) => {
  if (_db) {
    console.log('Db is already initialized!');
    return callback(null, _db);
  }

  if (!uri){
    console.log('MONGODB_URI is not defined in .env');
    return callback('Missing environment variable MONGODB_URI');
  }
  MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
      _db = client;
      callback(null, _db);
    })
    .catch(err => {
      callback(err);
    });
};

const getDb = () => {
  if (!_db) {
    throw Error('Db not initialized');
  }
  return _db;
};

module.exports = {
  connectDB,
  getDb
};