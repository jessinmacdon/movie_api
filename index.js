const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

//input validation
const { check, validationResult } = require('express-validator');


const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

// Enable this to connect the app with local Mongo DB
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Enable this to connect the app with MongoDB Atlas
const uri = ( 
  process.env.CONNECTION_URI
  // { useNewUrlParser: true, useUnifiedTopology: true },
  // () => {
  //   console.log('Connected to mongoDB');
  // }
);

const connectDB = async () => {
    try {
        uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        };

        console.log('MongoDB connected!!');
    } catch (err) {
        console.log('Failed to connect to MongoDB', err);
    }
};

connectDB();

mongoose.connect( uri, { 
  serverSelectionTimeoutMS: 5000
}).catch(err => console.log(err.reason));


//passing/invoking express in the app
const app = express();

//passing/invoking morgan for logging
app.use(morgan('common'));

//passing/invoking body-paser
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

//access control cors
const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);

const passport = require('passport');
require('passport');

//using express.static to display documentation.html file
app.use(express.static('/public'));

//route url - Home page
app.get('/', (req, res) => {
  res.send('Welcome to my Movie app');
});

// serving documentation - express.static
app.get('/documentation', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.sendFile(__dirname, 'documentation.html');
});

//get all users
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//return a (one) user
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((users) => {
        res.json(users);
    })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
      });
});

//creating new users - signup
app.post('/users', 
[
  check('Username', 'Username is required').isLength({min: 8}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email is not valid ').isEmail()
], (req, res) => {

  // Validation check - stops rest of code from being executed if error is returned
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + 'already exists');
  } else {
    Users
      .create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then ((user) => {res.status(201).json(user) })
      .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    })
  }
})
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//User updates - updating username
app.put('/users/:username', 
[
  check('Username', 'Username is required').isLength({min: 8}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
], (req, res) => {

  //Validation check - stops rest of code from being executed if error is returned
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  passport.authenticate('jwt', {session: false}), 
    (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.body.username },
      { $set:
        {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true },
      (err, updatedUser) => {
        if(err) {
          console.error(err);
          res.status(500).send('Error ' + err);
        } else {
          res.status(201).json(updatedUser);
        }
      });
    }
});

//deleting user account
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted successfully.');
      }
    })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
      });
});

//viewing movies list - json
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// gets all movies - by Title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

//user adding new movie to their list of favourite movies
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate ({ Username: req.params.Username},
  {
    $push: { FavouriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, UpdatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error ' + err);
    } else {
      res.json(UpdatedUser);
    }
  });
});

//user removing movies from their favourite movies list
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate ({ Username: req.params.Username},
  {
    $pull: { FavouriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, UpdatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error ' + err);
    } else {
      res.json(UpdatedUser);
    }
  });
});

//retrieving genre information
app.get('/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
      .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

//retrieving director information
app.get('/director/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
      .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});


//retrieving movies from a particular director
app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find({ 'Director.Name': req.params.Name })
      .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('We couldn\'t find any movies from ' + Director.Name + err);
    });
});

//retrieving movies of a particular genre
app.get('/movies/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find({ 'Genre.Name': req.params.Name })
      .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('We couldn\'t find any movies from the genre of' + Genre.Name + err);
    });
});

//error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

//action listener for clients port or 8080
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
