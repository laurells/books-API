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

  type User {
    id: ID!
    username: String!
    password: String!
    role: UserRole!
  }

  enum UserRole {
    ADMIN
    LIBRARIAN
  }

  type Query {
    books: [Book!]!
    book(id: ID): Book
    isAuthorized: Boolean!
    loginUser(username: String!, password: String!): Token!
    logout: String
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
    registerUser(username: String!, password: String!): User
    registerFakeUser(username: String!, password: String!): User
  }

  type Token {
    token: String!
  }
`;

module.exports = typeDefs;
