// Import required dependencies and modules
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { buildSubgraphSchema } = require('@apollo/federation');
const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client');
const { ApolloServerPluginInlineTraceDisabled } = require('apollo-server-core');

const typeDefs = require('./bookSchema');
const resolvers = require('./bookResolver');

console.log('typeDefs:', typeDefs);
console.log('resolvers:', resolvers);
const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

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
  context: ({ req, res }) => ({ req, res }),
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







