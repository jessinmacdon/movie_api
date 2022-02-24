const passport = require('passport'),
    localStrategy = require('passport-local').Strategy,
    models = require('./models.js'),
    passoprtJHT = require('passport-jwt');

let Users = Models.User,
    JWTStrategy = passportJWT.Strategy,
    ExtractJWT = passport.JWT.ExtractJwt;

    passport.use(new localStrategy({
        usernameField: 'Username',
        passwordField: 'password'
    }, (username, password, callback) => {
        console.log(username + ' ' + password);
        User.findOne({ Username: username}, (eroor, user) => {
            if (error) {
                console.log(error);
                return callback(error);
            }

            if (!user) {
                console.log('incorrect username');
                return callback(null, false, {message: 'incorrect username or password.'});
            }

            console.log('finished');
            return callback(null, user);
        });
    }));

    passport.use(new JWTStrattegy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: 'your_jwt_Secret'
    }, (JWTPayload, callback) => {
        return Users.findById(jwtPayload._id)
            .then((user) => {
                return callback(null, user);
            })
            .catch((error) => {
                return callback(error);
            });
    }));