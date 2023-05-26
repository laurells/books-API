// Import required dependencies and modules
const { ApolloServer, UserInputError, gql } = require('apollo-server-express');
const { buildSubgraphSchema, printSchema } = require('@apollo/federation');
const { ApolloServerPluginInlineTrace } = require('apollo-server-core');
const { writeFileSync } = require('fs');
const { join } = require('path');
const typeDefs = require('./bookSchema');
const resolvers = require('./bookResolver');
const { execute } = require('graphql');

const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      types {
        kind
        name
        possibleTypes {
          name
        }
      }
    }
  }
`;
console.log('typeDefs:', typeDefs);
console.log('resolvers:', resolvers);
// Create an instance of ApolloServer
const server = new ApolloServer({
  // Build federated schema using type definitions and resolvers
  
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  
  plugins: [
    ApolloServerPluginInlineTrace(),
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

  // Set up the context object with the request
  context: ({ req }) => ({ req }),
});

// Function to generate and write the API documentation
const generateAPIDocs = async () => {
  try {
    const introspectionResult = await execute(server.schema, gql(introspectionQuery));

    if (!introspectionResult || introspectionResult.errors) {
      throw new Error('Failed to fetch introspection query result');
    }

    const schemaSDL = printSchema(introspectionResult.data);

    const outputPath = join(__dirname, 'generated', 'api-docs.graphql');
    writeFileSync(outputPath, schemaSDL);

    console.log('API documentation generated successfully.');
  } catch (error) {
    console.error('Failed to generate API documentation:', error);
  }
};

// Function to set up GraphQL server and apply it as middleware in Express app
const setupGraphQL = async (app) => {
  try {
    await server.start();
    server.applyMiddleware({ app });

    // Generate and write the API documentation
    // generateAPIDocs();
  } catch (error) {
    console.error('Failed to set up GraphQL server:', error);
  }
};

// Export the setupGraphQL function
module.exports = { setupGraphQL, generateAPIDocs };





// // Import required dependencies and modules
// const { ApolloServer, UserInputError } = require('apollo-server-express');
// const { buildSubgraphSchema, introspectionQuery, printSchema } = require('@apollo/federation');
// const typeDefs = require('./bookSchema');
// const resolvers = require('./bookResolver');
// const { ApolloServerPluginInlineTrace } = require('apollo-server-core');
// const { writeFileSync } = require('fs');
// const { join } = require('path');
// const fetch = require('isomorphic-fetch');

// // Create an instance of ApolloServer
// const server = new ApolloServer({
//   // Build federated schema using type definitions and resolvers
//   schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
//   plugins: [
//     ApolloServerPluginInlineTrace(),
//   ],

//   // Handle formatting of errors
//   formatError: (error) => {
//     if (error.originalError instanceof UserInputError) {
//       return {
//         message: error.message,
//         validationErrors: error.originalError.extensions.exception.validationErrors,
//       };
//     }
//     // Handle other errors
//     return error;
//   },

//   // Configure cache settings
//   cache: "bounded",

//   // Disable persisted queries
//   persistedQueries: false,

//   // Set up the context object with the request
//   context: ({ req }) => ({ req }),
// });

// // Function to set up GraphQL server and apply it as middleware in Express app
// const setupGraphQL = async (app) => {
//   await server.start();
//   server.applyMiddleware({ app });

//   // Generate and write the API documentation
//   const generateAPIDocs = async () => {
//     try {
//       const endPoint = 'http://localhost:3000/graphql';
//       const response = await fetch(endPoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ query: introspectionQuery }),
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to fetch introspection query result: ${response.status} ${response.statusText}`);
//       }

//       const introspectionResult = await response.json();

//       const schemaSDL = printSchema(introspectionResult.data);

//       const outputPath = join(__dirname, 'generated', 'api-docs.graphql');
//       writeFileSync(outputPath, schemaSDL);

//       console.log('API documentation generated successfully.');
//     } catch (error) {
//       console.error('Failed to generate API documentation:', error);
//     }
//   };

//   generateAPIDocs();
//   setTimeout(generateAPIDocs, 2000);
// };

// // Export the setupGraphQL function
// module.exports = { setupGraphQL };
