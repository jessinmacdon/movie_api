const passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    Models = require('./models.js'),
    passportJWT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passportJWT.ExtractJwt;

// Strategy to define basic HTTP authentication for login requests
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

// Strategy to authenticate users based on JWT
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