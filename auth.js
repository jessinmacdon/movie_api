const jwtSecret = 'your_jwt_secret';
const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport');


/**
 * creates JWT (expiring in 7 days, using HS256 algorithm to encode)
 *
 * @function generateJWTToken - generate JWT Token 
 * @param {object} user - user object
 * @returns {jwtSecret} - token used for authentication
 */
let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });
}


/**
 * POST: login endpoint handles user login, generating a jwt upon login
 *
 * @function endpoint use the generated jwt `generateJWTToken` from to log user in 
 * @param {*} router - take user to the main pag (on client side app)
 * @type {Request} 
 * @requires passport
 */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());

                return res.json({ user, token });
            });
        })(req, res);
    });
}