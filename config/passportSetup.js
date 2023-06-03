const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;

const configureOAuth2Strategy = (clientId, clientSecret, callbackURL) => {
  passport.use(
    'oauth2',
    new OAuth2Strategy(
      {
        authorizationURL: 'your_authorization_url', // Replace with your actual authorization URL
        tokenURL: 'your_token_url', // Replace with your actual token URL
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Assuming you have a User model for storing user data
          const User = require('./models/User');

          // Find or create the user based on the profile information
          const user = await User.findOne({ oauthId: profile.id });

          if (user) {
            // User already exists, update the access token
            user.accessToken = accessToken;
            await user.save();
            done(null, user);
          } else {
            // User doesn't exist, create a new user with the profile data
            const newUser = new User({
              oauthId: profile.id,
              accessToken: accessToken,
              // Extract other relevant data from the profile object
              // For example:
              name: profile.displayName,
              email: profile.emails[0].value,
            });

            await newUser.save();
            done(null, newUser);
          }
        } catch (err) {
          done(err);
        }
      }))
};

// Middleware to initialize Passport and session handling
const initializePassport = () => {
  // Initialize Passport
  passport.initialize();

  // Enable session handling
  passport.session();
};

// Middleware to handle the OAuth2 authentication flow
const authenticateOAuth2 = (options) => {
  return passport.authenticate('oauth2', options);
};

// Middleware to handle the OAuth2 callback
const handleOAuth2Callback = (options) => {
  return passport.authenticate('oauth2', options);
};

module.exports = {
  configureOAuth2Strategy,
  initializePassport,
  authenticateOAuth2,
  handleOAuth2Callback,
};
