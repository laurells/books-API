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
  updateBook(id: ID!, title: String, author: String, publicationYear: Int, genre: String, isbn: String): Book
  deleteBook(id: ID): Book
  createRandomBook: Book!
  saveUserData: User!
}

Directives: Directives provide additional instructions to the GraphQL execution engine. In this schema, you have the following directives:

@key: Specifies the key fields for objects or interfaces that participate in Apollo Federation.
@extends: Indicates that a type or interface extends another type or interface in Apollo Federation.
@external: Marks a field or object as being owned by another service in Apollo Federation.
@requires: Specifies the fields required by a field in Apollo Federation.
@provides: Indicates the fields provided by a field in Apollo Federation.
Types:

Book: Represents a book with properties such as id, title, author, publicationYear, genre, and isbn.
User: Represents a user with properties user_id and user_name.
Queries:

Query: Defines the available queries in the schema. It includes:
_service: Represents the federated service capabilities.
books: Returns a list of books.
book: Retrieves a book by its id.
isAuthorized: Indicates if the user is authorized.
_Service: Represents the federated service capabilities, including the sdl field that provides the SDL representation of the federated service.

Mutations:

Mutation: Defines the available mutations in the schema. It includes:
createBook: Creates a new book with the provided details.
updateBook: Updates the details of an existing book identified by its id.
deleteBook: Deletes a book identified by its id.
createRandomBook: Creates a new book with random details.
saveUserData: Saves user data.
This schema can be used as a blueprint for implementing a GraphQL API with the defined types, queries, and mutations.