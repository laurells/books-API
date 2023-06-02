const { Router } = require('express');
const { Issuer } = require('openid-client');
const { configureOAuth2Strategy, initializePassport, authenticateOAuth2, handleOAuth2Callback } = require('./config/passportSetup');
const dotenv = require('dotenv');

dotenv.config()

const router = Router();

const clientID = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const callbackURL = process.env.BASEURL;
const discoveryURL = process.env.ISSUER; // Replace with the OAuth2 provider's discovery URL

// Configure OAuth2 strategy
configureOAuth2Strategy(clientID, clientSecret, callbackURL);

// Initialize Passport and session handling
initializePassport();

// Set up routes for OAuth2 authentication
router.get('/auth/oauth2', authenticateOAuth2({ scope: 'profile' }));

router.get(
  '/auth/oauth2/callback',
  handleOAuth2Callback({ failureRedirect: '/login', successRedirect: '/profile' }),
  (req, res) => {
    // Redirect or respond to successful authentication
    res.send({ message: 'Authentication successful' });
  }
);

router.get('/auth/callback', async (req, res) => {
  try {
    const issuer = await Issuer.discover(discoveryURL);
    const client = new issuer.Client({
      client_id: clientID,
      client_secret: clientSecret,
    });

    const params = client.callbackParams(req);
    const tokenSet = await client.callback(callbackURL, params, { nonce: req.session.nonce });

    // Retrieve relevant user information from the tokenSet
    const { sub: userId, name: userName, email } = tokenSet.claims();
    console.log('User ID:', userId);
    console.log('Username:', userName);
    console.log('User Email', email);

    // Perform further actions with the retrieved user information, such as storing it in a database or creating a user session

    // Redirect the user to the desired page
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error handling OAuth2 callback:', error);
    res.status(500).send('Failed to handle OAuth2 callback');
  }
});

module.exports = router;
