const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    publicationYear: Int!
    genre: String!
    isbn: String!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
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
      id: ID!
      title: String
      author: String
      publicationYear: Int
      genre: String
      isbn: String
    ): Book
    deleteBook(id: ID!): Book
    createRandomBook: Book!
  }
`;

module.exports = typeDefs;