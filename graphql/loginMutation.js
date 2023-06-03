const { gql } = require('@apollo/client');

exports.LOGIN_USER = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      id
      username
    }
  }
`;