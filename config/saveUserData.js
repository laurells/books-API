// const { validationResult } = require('express-validator');
// const connectDB = require('../database/db');

// const saveUserData = async (_, __, { req }) => {
//     try {
//         // Validate user authentication
//         if (!req.oidc.isAuthenticated()) {
//             throw new Error('Not authorized to check user status - please log in');
//         }

//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             throw new Error(JSON.stringify(errors.array()));
//         }

//         const user_data = {
//             user_id: req.oidc.user.sub,
//             user_name: req.oidc.user.name,
//         };

//         const alreadyExists = await connectDB
//             .getDb()
//             .db('Book-Manager')
//             .collection('user_data')
//             .findOne(user_data);

//         if (alreadyExists) {
//             return user_data;
//         }

//         // If the user doesn't already exist, add user info to the database
//         const response = await connectDB
//             .getDb()
//             .db('Book-Manager')
//             .collection('user_data')
//             .insertOne(user_data);

//         if (response.acknowledged) {
//             return user_data;
//         } else {
//             throw new Error(response.error || 'Some error occurred while adding a new user to the db.');
//         }
//     } catch (err) {
//         throw new Error(err.message);
//     }
// }

// module.exports = { saveUserData }