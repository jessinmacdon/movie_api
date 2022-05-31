/**
 * @file the aim of this file is to implement 2 passport strategies that will be used to authenticate requests
 * to the overall API endpoints. When the user logs in our app, this will function as a validation method for the username and password
 * and compare them to our users collection in the database area.
 * The JWT strategy is also used, this will decode the Web Token returned to the user after having successfully login, after it will check the user ID, and if it matches
 * the user collection in the database.
 * @requires passport-local This was used to create a local strategy
 * @requires passport For authentication and validation to the requests over the API endpoints
 * @requires passport-jwt To extract tokens from the requests
 * @requires '.models.js' This is where we defined our models and schemas
 */


// requiring passport
const passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

/**  Strategy to define basic HTTP authentication for login requests */
passport.use(new localStrategy({
    // Take username and password from request body
    usernameField: 'Username',
    passwordField: 'Password'
}, (username, password, callback) => {
    console.log(username + ' ' + password);
    // Use mongoose to check database for user with same username
    Users.findOne({ Username: username }, (error, user) => {
        if (error) {
            console.log(error);
            return callback(error);
        }
        // No user matches username
        if (!user) {
            console.log('incorrect username');
            return callback(null, false, { message: 'incorrect username or password.' });
        }
        // Password wrong (use validatePassword to compare to hashed password stored in DB)
        if (!user.validatePassword(password)) {
            console.log('Incorrect password');
            return callback(null, false, { message: 'incorrect password.' });
        }
        // Username and password match - Execute callback
        console.log('finished');
        return callback(null, user);
    });
}));

/** Strategy to authenticate users based on JWT */
passport.use(new JWTStrategy({
    // Extract JWT from header of HTTP request
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, async (jwtPayload, callback) => {
    // Return the user by userID
    try {
        const user = await Users.findById(jwtPayload._id);
        return callback(null, user);
    } catch (error) {
        return callback(error);
    }
}));