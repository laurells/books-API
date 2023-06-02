// Import required dependencies and modules
const express = require('express');
const dotenv = require('dotenv');
const { ApolloServer, UserInputError, AuthenticationError } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/federation');
const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client');
const { ApolloServerPluginInlineTraceDisabled } = require('apollo-server-core');
const oauthSetup = require('./oauthSetup');
const jwt = require('jsonwebtoken');
const typeDefs = require('./bookSchema');
const resolvers = require('./bookResolver');
const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);
const jwtSecret = 'your_jwt_secret'; // Replace with your JWT secret key
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};
const app = express();
dotenv.config()

console.log('typeDefs:', typeDefs);
console.log('resolvers:', resolvers);

// Configure OAuth2 credentials (obtained from the Authorization Server)
const clientId = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const callbackURL = process.env.BASEURL;

oauthSetup.configureOAuth2Strategy(clientId, clientSecret, callbackURL);

app.use('/', oauthSetup);
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
  context: ({ req }) => {
    // Get the token from the request headers
    const token = req.headers.authorization || '';

    // Verify and decode the token
    const decodedToken = verifyToken(token);

    // Extract the user ID from the decoded token
    const userId = decodedToken.userId;

    // You can perform additional checks here, such as checking if the user exists in your database or if the token has the necessary permissions

    // Add the user ID to the context object
    return { userId };
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
    server.applyMiddleware({ app });
  } catch (error) {
    console.error('Failed to set up GraphQL server:', error);
  }
};

// Export the setupGraphQL function
module.exports = { setupGraphQL };
