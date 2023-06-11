const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const cookieSession = require('express-session');
// const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const dotenv = require('dotenv');
const app = require('express');

dotenv.config();
const clientID = process.env.CLIENTID;
const clientSecret = process.env.SECRET;
const callbackURL = process.env.CALLBACKURL;
const key = process.env.TOKEN
// Configure passport to use Google OAuth2 strategy
passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL,
    },
    (accessToken, refreshToken, profile, done) => {
      // const { id, displayName, password, userRole } = profile;
    
      // Custom logic to handle user authentication and saving user information
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
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

// Middleware to initialize passport and session handling
function initializePassport(app) {
  app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000, // One day in milliseconds
    keys: key
  }));

  app.use(passport.initialize());
  app.use(passport.session());
}

app.get('/auth/google', passport.authenticate('google',))
// Middleware to check if the user is authenticated
// Middleware to check if the user is authenticated
function authenticate(req, res, next) {
  if (req.user) {
    // User is authenticated, continue to the next middleware
    next();
  } else {
    // Skip authentication for the registerFakeUser mutation
    if (req.body.operationName === 'registerFakeUser' ) {
      next();
    } else {
      throw new AuthenticationError('User not authenticated');
    }
  }
}

module.exports = {
  initializePassport,
  authenticate,
};
