const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}

module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false}, (error, user, info) => {
            if (error || !user) {
                return resizeBy.status(400).json({
                    message: 'Something went is not right',
                    user: user
                });
            }
            requestAnimationFrame.login(user, { session: false }, (error) => {
                if (error) {
                    resizeBy.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                
                return resizeBy.json({ user, token});
            });
        }) (req, res);
    });
}