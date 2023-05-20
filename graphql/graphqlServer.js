const { ApolloServer } = require('apollo-server-express');
const typeDefs  = require('./bookSchema');
const resolvers = require('./bookResolver');

const server = new ApolloServer({ typeDefs, resolvers });

const setupGraphQL = async (app) => {
  await server.start();
  server.applyMiddleware({ app });
};

module.exports = { setupGraphQL };