directive @key(fields: String!) on OBJECT | INTERFACE

directive @extends on OBJECT | INTERFACE

directive @external on OBJECT | FIELD_DEFINITION

directive @requires(fields: String!) on FIELD_DEFINITION

directive @provides(fields: String!) on FIELD_DEFINITION

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
  _service: _Service!
  books: [Book!]!
  book(id: ID): Book
  isAuthorized: Boolean!
}

type _Service {
  """
  The sdl representing the federated service capabilities. Includes federation directives, removes federation types, and includes rest of full schema after schema directives have been applied
  """
  sdl: String
}

type Mutation {
  createBook(title: String!, author: String!, publicationYear: Int!, genre: String!, isbn: String!): Book!
  updateBook(id: ID, title: String, author: String, publicationYear: Int, genre: String, isbn: String): Book
  deleteBook(id: ID): Book
  saveUserData: User!
}