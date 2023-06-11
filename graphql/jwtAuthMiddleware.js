const redis = require('redis');
const JWTR = require('jwt-redis').default;
const redisClient = redis.createClient();
const jwtr = new JWTR(redisClient);

const jwtAuthMiddleware = (req, res, next) => {
  const token = req.header('auth-token');

  // IN CASE THE TOKEN DOESN'T EXIST
  if (!token || token === '') {
    req.isAuth = false;
    next(); // Call the next middleware or route handler
    return;
  }

  try {
    jwtr.verify(token, process.env.SECRET_TOKEN)
      .then(verified => {
        // IN CASE TOKEN EXISTS AND VALID
        req.user = verified;
        req.isAuth = true;
        next(); // Call the next middleware or route handler
      })
      .catch(() => {
        // IN CASE TOKEN EXISTS BUT INVALID
        req.isAuth = false;
        next(); // Call the next middleware or route handler
      });
  } catch (err) {
    req.isAuth = false;
    next(); // Call the next middleware or route handler
  }
};

module.exports = jwtAuthMiddleware;
