// Import the necessary modules
const express = require('express');
const router = express.Router();
// const { graphqlHTTP } = require('express-graphql');

// // Define the GraphQL schema and resolvers
// const schema = require('../bookSchema');// Define your schema here
// const root = require('../bookResolver');// Define your resolvers here

// router.use('/graphql', graphqlHTTP({
//   schema,
//   rootValue: root,
//   graphiql: true // Enable the GraphiQL interface for testing
// }));

// Use the './swagger' module to handle requests to the root endpoint '/'
router.use('/', require('./swagger'));

// Use the './books' module to handle requests to the '/books' endpoint
router.use('/books', require('./book'));

// Use the './book-generator' module to handle requests to the '/book-generator' endpoint
router.use('/book-generator', require('./books-generator'));

// Export the router object to be used by other modules
module.exports = router;