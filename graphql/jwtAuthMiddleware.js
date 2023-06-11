const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { ApolloError } = require('apollo-server-express');

const jwtAuthMiddleware = async (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      // Verify the JWT token
      const decodedToken = jwt.verify(token, process.env.TOKEN);
      const userId = decodedToken.userId;

      // Find the user by the decoded user ID
      const user = await User.findById(userId);

      if (!user) {
        throw new ApolloError('User not found', 'USER_NOT_FOUND');
      }

      req.user = user;
      req.isAuth = true;
    } catch (error) {
      req.isAuth = false;
    }
  } else {
    req.isAuth = false;
  }
};

module.exports = jwtAuthMiddleware;
