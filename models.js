const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


// defining the schema for movies
let movieSchema = mongoose.Schema ({
    Title: {type: String, required: true},
    Description: {type: String, required: true},
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

//defining the Scema for users
let userSchema = mongoose.Schema ({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 8);
};

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

//populating the users favouriteMovies array
function addFavouriteMovies (Username) {
    return User.findOne({ Username: Username })
    .populate('movies').exec((err, Users) => {
        console.log('Populated User' + Movie.Title);
    })
}

//creating models
let Movie = mongoose.model('Movie', movieSchema);

let User = mongoose.model('User', userSchema);

//esporting modules
module.exports.Movie = Movie;
module.exports.User = User;