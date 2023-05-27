// Import the necessary module
const { gql } = require("apollo-server-express");

// Define the GraphQL schema using the gql template literal
const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    publicationYear: Int!
    genre: String!
    isbn: String!
  }
  type User {
    user_id: ID!
    user_name: String!
  }

  type Query {
    books: [Book!]!
    book(id: ID): Book
    isAuthorized: Boolean!
  }

  type Mutation {
    createBook(
      title: String!
      author: String!
      publicationYear: Int!
      genre: String!
      isbn: String!
    ): Book!
    updateBook(
      id: ID
      title: String
      author: String
      publicationYear: Int
      genre: String
      isbn: String
    ): Book
    deleteBook(id: ID): Book
    createRandomBook: Book!
    saveUserData: User!
  }
`;

// Export the GraphQL schema
module.exports = typeDefs;
