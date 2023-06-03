// Import required dependencies and modules
const { ObjectId } = require('mongodb');
const connectDB = require('../database/db');
const express = require('express');
const dotenv = require('dotenv');
const { initializePassport } = require('../config/passportSetup');
const { ApolloServer, UserInputError, AuthenticationError } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/federation');
const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client');
const { ApolloServerPluginInlineTraceDisabled } = require('apollo-server-core');
const jwt = require('jsonwebtoken');
const typeDefs = require('./bookSchema');
const resolvers = require('./bookResolver');
const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);
dotenv.config();
const jwtSecret = process.env.TOKEN; // Replace with your JWT secret key
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};
const app = express();

// Configure Passport.js
initializePassport(app);

// Create an instance of ApolloServer
const server = new ApolloServer({
  // Build federated schema using type definitions and resolvers
  schema,
  plugins: [ApolloServerPluginInlineTraceDisabled()],

  // Handle formatting of errors
  formatError: (error) => {
    if (error.originalError instanceof UserInputError) {
      return {
        message: error.message,
        validationErrors: error.originalError.extensions.exception.validationErrors,
      };
    }
    // Handle other errors
    return error;
  },

  // Configure cache settings
  cache: 'bounded',

  // Disable persisted queries
  persistedQueries: false,
  introspection: true,

  // Set up the context object with the request
  context: async ({ req }) => {
    // Get the token from the request headers
    const token = req.headers.authorization || '';

    // Verify and decode the token
    const decodedToken = verifyToken(token);

    // Extract the user ID from the decoded token
    const userId = decodedToken.userId;

    // Retrieve user information from the database based on the user ID
    const db = connectDB.getDb().db('Book-Manager'); // Replace with your database name
    const user = await db.collection('books').findOne({ _id: new ObjectId(userId) });
    // const user = await User.findById(userId);

    // Add the user information to the context object
    return { user };
  },
});

// Create an instance of ApolloClient
const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:3000/graphql' || 'https://codewithrels.onrender.com/graphql' }), 
  cache: new InMemoryCache(),
});

async function makeGraphQLRequest() {
  const query = gql`{
    __typename
  }`;

  try {
    const response = await client.query({ query });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

// Call the function to make the GraphQL request
makeGraphQLRequest();

// Function to set up GraphQL server and apply it as middleware in Express app
const setupGraphQL = async (app) => {
  try {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql', cors: false });
  } catch (error) {
    console.error('Failed to set up GraphQL server:', error);
  }
};

// Export the setupGraphQL function
module.exports = { setupGraphQL };
