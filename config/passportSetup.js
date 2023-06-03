const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
// const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const dotenv = require('dotenv');

dotenv.config();

// Configure passport to use Google OAuth2 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: process.env.CALLBACKURL,
    },
    (accessToken, refreshToken, profile, done) => {
      const { id, displayName, emails } = profile;
    
      // Custom logic to handle user authentication and saving user information
      // Replace this with your own implementation, e.g., saving the user to a database
      const user = {
        id,
        name: displayName,
        email: emails[0].value,
      };
    
      done(null, user);
    }
    
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware to check if the user is authenticated
function authenticate(req, res, next) {
  if (!req.user) {
    throw new AuthenticationError('User not authenticated');
  }

  next();
}

// Middleware to initialize passport and session handling
function initializePassport(app) {
  app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // One day in milliseconds
    keys: ['randomstringhere']
  }));

  app.use(passport.initialize());
  app.use(passport.session());
}

module.exports = {
  initializePassport,
  authenticate,
};
