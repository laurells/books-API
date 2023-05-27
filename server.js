const express = require('express');
const { connectDB } = require('./database/db');
const { setupGraphQL } = require('./graphql/graphqlServer');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const router = require('./routes');
// const { graphqlHTTP } = require('express-graphql');
// const typeDefs = require('./graphql/bookSchema');
// const resolvers  = require('./graphql/bookResolver');

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

app.use('/', router);
// app.use('/graphql', graphqlHTTP({
//   schema: typeDefs,
//   rootValue: resolvers,
//   graphiql: true  // Enable GraphiQL for testing the API
// }));

// Connect to MongoDB
connectDB((err) => {
  if (err) {
    console.error('Failed to connect to MongoDB', err);
    // Handle the error
    return;
  }
  setupGraphQL(app);
 


  setTimeout(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }, 2000); // Adjust the delay as needed
  
});
