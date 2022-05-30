/**
 * @file The index file creates the Express api app, sets up the server and implements routes to Api
 * endpoints used to access myFlixDB. Requests are made to these endpoints using mongoose models found in the
 * models.js file and following auth rules implemented in the passport.js file. The DB is hosted on mango atlas, we access the DB using mongoose connect method. 
 * The server is hosted on Heroku
 * @requires express Used to create an express application.
 * @requires express-validator Used to perform validation on data provided when creating or updating a user.
 * @requires mongoose Connects the app to the database and implements data schemas using models.
 * @requires './models.js' The file where data schemas and models are defined.
 * @requires morgan Used to log requests made to the database.
 * @requires passport Used to create strategies for authenticating and authorising requests to the Api endpoints.
 * @requires './auth.js' The file that implements the user login route.
 * @requires cors Used to control origins from which requests to the server can be made.
 */

// requiring express, morgan middleware, body parser and uuid
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

//input validation
const { check, validationResult } = require('express-validator');

//Import Mongoose, models.js and all defined within it(movies and users)
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;


/** 
* Connecting to MongoDB myFlixDB 
* a) Connect to Local DB - Enable this to connect the app with local Mongo DB
*/

/** 
* const uri = mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
*/

/** 
 * b) Connect to Hosted DB - Enable this to connect the app with MongoDB Atlas 
 * make sure to disconnect local local DB when enabling this and vice versa
 */
const uri = (
  process.env.CONNECTION_URI
);

/** async mongoose.connect function */
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

/** track mongoose connection errors for more information if error were to occur */
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000
}).catch(err => console.log(err.reason));


/** passing/invoking express in the app */
const app = express();

/**
 * invoke morgan middleware library to log request data in terminal 
 */
app.use(morgan('common'));

/** passing/invoking body-paser */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/** import and access control cors to set allowed origins */
const cors = require('cors');
app.use(cors());

/** import auth.js file - authentication */
let auth = require('./auth')(app);

/** import passport.js file and invoke the model */
const passport = require('passport');
require('passport');

/** using express.static to display documentation.html file */
app.use(express.static('/public'));


/**
 * GET: Takes the user the welcome page displaying a welcome message "/" url
 * @param {*} router 
 * @returns Welcome message
 */
app.get('/', (req, res) => {
  res.send('Welcome to my Movie app');
});

/**
 * Serves static content for the app from the 'public' directory
 */
app.get('/documentation', (req, res) => {
  res.sendFile(__dirname, 'documentation.html');
});

/** 
 * GET: Returns a list of ALL users
 * Request body: Bearer token
 * @returns array of user objects
 * @requires passport
 */
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * GET: Returns data on one/single user (user object) by username
 * @fetchAPI GET:
 * @param Username
 * @returns user object
 * @requires passport
 */
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

/**
 * POST: Allows users to register/sign up; Username, Password & Email are required fields!
 * @param {fetchAPI} users - body: Bearer token, JSON with user information
 * @returns user object
 */
app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 8 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email is not valid ').isEmail()
  ], (req, res) => {

    // Validation check - stops rest of code from being executed if error is returned
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);
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
            .then((user) => { res.status(201).json(user) })
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

/**
 * PUT: Allow users to update their user details 
 * @param {fetchAPI} users body: Bearer token, updated user info
 * @param Username
 * @returns user object with updates
 * @requires passport
 */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
  [
    check('Username', 'Username is required').isLength({ min: 8 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
  ], (req, res) => {

    //Validation check - stops rest of code from being executed if error is returned
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set:
        {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error ' + err);
        } else {
          res.status(201).json(updatedUser);
        }
      });
  });

/**
 * DELETE: Allows users to delete their account - derigister
 * @param {fetchAPI} users - body: Bearer token
 * @param Username
 * @returns success message
 * @requires passport
 */
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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

/**
 * GET: Returns a list of ALL movies 
 * @param {fetchAPI} movies body: Bearer token
 * @returns array of movie objects
 * @requires passport
 */
app.get('/movies', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

/**
 * GET: Returns all data pertaining to a single movie to the user
 * @param {fetchAPI} movies body: Bearer token
 * @param movieId
 * @returns movie object
 * @requires passport
 */
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

/**
 * POST: Allows users to add a movie to their list of favourite movies
 * @param {fetchAPI} users body: Bearer token
 * @param username
 * @param movieId
 * @returns user object
 * @requires passport
 */
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    {
      $push: { FavouriteMovies: req.params.MovieID }
    },
    { new: true },
    (err, UpdatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error ' + err);
      } else {
        res.json(UpdatedUser);
      }
    });
});

/**
 * GET: Returns a list of favourite movies from the user
 * @param {fetchAPI} users body: Bearer token
 * @param Username
 * @returns array of favourite movies
 * @requires passport
 */
app.get('/users/:Username/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (user) { // If a user with the corresponding username was found, return user info
        res.status(200).json(user.FavouriteMovies);
      } else {
        res.status(400).send('Could not find favourite movies for this user');
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * DELETE: Allows users to remove a movie from their list of favourite movies
 * @param {fetchAPI} users body: Bearer token
 * @param Username
 * @param movieId
 * @returns user object
 * @requires passport
 */
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username },
    {
      $pull: { FavouriteMovies: req.params.MovieID }
    },
    { new: true },
    (err, UpdatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error ' + err);
      } else {
        res.json(UpdatedUser);
      }
    });
});

/**
 * GET: Returns data of a particular genre including information like Name, description
 * @param {fetchAPI} movies body: Bearer token
 * @param Name (Director.Name)
 * @returns director object
 * @requires passport
 */
app.get('/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

/**
 * GET: Returns a data about a director by name
 * @param {fetchAPI} movies body: Bearer token
 * @param Name (Director.Name)
 * @returns director object
 * @requires passport
 */
app.get('/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});


/**
 * GET: Returns data about a director of a particular movie including bio, birth year, death year
 * @param {fetchAPI} movies body: Bearer token
 * @param Name (Director.Name)
 * @returns director object
 * @requires passport
 */
app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ 'Director.Name': req.params.Name })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('We couldn\'t find any movies from ' + Director.Name + err);
    });
});

/**
 * GET: Returns data about a genre of a particular movie including name and description (e.g: Action)
 * @param {fetchAPI} movies body: Bearer token
 * @param Name (Genre.Name)
 * @returns genre object
 * @requires passport
 */
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find({ 'Genre.Name': req.params.Name })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('We couldn\'t find any movies from the genre of' + Genre.Name + err);
    });
});

/**
 * error handler
 */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});


/**
 * defines port, action listener for clients port or 8080
 */
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
