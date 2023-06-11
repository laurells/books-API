const { ObjectId } = require('mongodb');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/federation');
const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client');
const { ApolloServerPluginInlineTraceDisabled } = require('apollo-server-core');
const connectDB = require('../database/db');
const typeDefs = require('./bookSchema');
const resolvers = require('./bookResolver');


// Create an instance of ApolloServer
const server = new ApolloServer({
  // Build federated schema using type definitions and resolvers
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  plugins: [
    ApolloServerPluginInlineTraceDisabled(),
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
  context: async ({ req }) => {
    // Retrieve user information from the database based on the user ID
    const db = connectDB.getDb().db('User-Management'); // Replace with your database name
    const user = await db.collection('user_collection').findOne({ _id: new ObjectId(req.user.id) });

    // Add the user information to the context object
    return { user };
  },
});

// Create an instance of ApolloClient
const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:3000/graphql' || 'https://codewithrels.onrender.com/graphql' }),
  cache: new InMemoryCache(),
});

// Function to make a GraphQL request using ApolloClient
async function makeGraphQLRequest() {
  const query = gql`
  query IntrospectionQuery {
    __schema {
      types {
        name
      }
    }
  }
`;

  try {
    const response = await client.query({ query });
    console.log('GraphQL Response:', response.data);
  } catch (error) {
    console.error('GraphQL Error:', error);
  }
}

// Call the function to make the GraphQL request
makeGraphQLRequest();

// Start the Apollo Server
// Start the Apollo Server
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
  setupGraphQL
};
