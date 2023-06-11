const express = require('express');
const { connectDB } = require('./database/db');
const { setupGraphQL } = require('./graphql/graphqlServer');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const { Strategy: OAuth2Strategy } = require('passport-oauth2');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Z-Key'
  );
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 86400000,
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure OAuth2Strategy
passport.use(
  new OAuth2Strategy(
    {
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenURL: 'https://oauth2.googleapis.com/token',
      clientID: process.env.CLIENTID,
      clientSecret: process.env.SECRET,
      callbackURL: process.env.CALLBACKURL,
      scope: ['email', 'profile']
    },
    (accessToken, refreshToken, profile, done) => {
      // Custom logic to handle user authentication and saving user information
      // Replace this with your own implementation
      const user = {
        id: profile.id,
        email: profile.email,
      };
      return done(null, user);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Connect to MongoDB
connectDB((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB', err);
    // Handle the error
    return;
  }
  setupGraphQL(app);

  // Define routes for OAuth authentication
  app.get('/auth', passport.authenticate('oauth2'));


  app.get(
    '/auth/callback',
    passport.authenticate('oauth2', {
      successRedirect: '/graphql',
      failureRedirect: '/login',
    })
  );

  // Define route for logging out
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
