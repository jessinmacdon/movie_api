/**
 * @file This file will implement schemas for documents in the movies and users collections in
 * my myFlix database. Models are created through these schemas, which are used in http requests
 * to Api endpoints to read, update, create and delete these documents from my database. Mongoose is
 * connected to the database using the connect method in the index file.
 * @requires mongoose Connects the app to the database and implements data schemas using models.
 * @requires bcrypt This is  used to implement secutiry and encryption on user passwords.
*/

// requiring mongoose, bycript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


/**  defining the schema for movies */
let movieSchema = mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: String,
        Description: String,
    },
    Director: {
        Name: String,
        Bio: String
    },
    ImagePath: String,
    Featured: Boolean
});

/** defining the Schema for users */
let userSchema = mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    Birthday: Date,
    FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

/** use bcript to hash passwords */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 8);
};

/** validate passowrds */
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};

/** populating the users favouriteMovies array */
function addFavouriteMovies(Username) {
    return User.findOne({ Username: Username })
        .populate('movies').exec((err, Users) => {
            console.log('Populated User' + Movie.Title);
        })
}

/** creating models */
let Movie = mongoose.model('Movie', movieSchema);

let User = mongoose.model('User', userSchema);

/** exporting models */
module.exports.Movie = Movie;
module.exports.User = User;