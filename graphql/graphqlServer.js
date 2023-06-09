// const { ObjectId } = require('mongodb');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/federation');
// const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client');
const { ApolloServerPluginInlineTraceDisabled } = require('apollo-server-core');
// const connectDB = require('../database/db');
const typeDefs = require('./bookSchema');
const resolvers = require('./bookResolver');
// const { buildContext } = require('graphql-passport');
// const User = require('../models/user');
const jwtAuthMiddleware = require('./jwtAuthMiddleware');

// Create an instance of ApolloServer
const server = new ApolloServer({
  // Build federated schema using type definitions and resolvers
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [
    ApolloServerPluginInlineTraceDisabled(),
    // {
    //   async requestDidStart({ context }) {
    //     if (!context.user) {
    //       throw new AuthenticationError('Unauthorized');
    //     }
    //   },
    // },
  ],

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
  playground: true,

  // Set up the context object with the request
  context: ({ req }) => {
    // Apply the JWT authentication middleware to the request object
    jwtAuthMiddleware(req);

    return {
      user: req.user,
      isAuth: req.isAuth,
    };
  },
});


// Function to set up GraphQL server and apply it as middleware in Express app
const setupGraphQL = async (app) => {
  try {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql', cors: true });
  } catch (error) {
    console.error('Failed to set up GraphQL server:', error);
    process.exit(1); // Exit the process with an error status
  }
};

module.exports = {
  setupGraphQL,
};
