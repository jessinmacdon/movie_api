const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });


//passing/invoking express iin the app
const app = express();

//passing/invoking morgan for logging
app.use(morgan('common'));

//passing/invoking body-paser
app.use(bodyParser.json());

//using express.static to display documentation.html file
app.use(express.static('/public'));

//adding users / in-memory
/*let users = [
  {
    id: 1,
    name: 'Macdon',
    favouriteMovies: ['The Matrix']
  },

  {
    id: 2,
    name: 'Jessin',
    fovouriteMovies: []
  },

  {
    id: 3,
    name: 'Omalle',
    favouriteMovies: ['BlackPanther']
  },

  {
    id: 4,
    name: 'Jameson',
    favouriteMovies: ['Fight Club']
  },
]

//adding top movies list(array)
let topMovies = [
  {
    "Title": "Black Panther",
    "Genre": {"Name": "Action"},
    "Director": {"Name": "Ryan Coogler"},
    "Country": {"Name": "U.S.A"}
  },

  {
    "Title": "The Avengers Series",
    "Genre": {"Name": "Sci-fi"},
    "Director": {"Name": "Kevin Feige"},
    "Country": {"Name": "U.S.A"}
  },

  {
    "Title": "Star Wars",
    "Genre": {"Name": "Sci-fi"},
    "Director": {"Name": "George Lucas"},
    "Country": {"Name": "U.S.A"}
  },

  {
    "Title": "The Dark Knight",
    "Genre": {"Name": "Action"},
    "Director": {"Name": "Christopher Nolan"},
    "Country": {"Name": "U.S.A"}
  },

  {
    "Title": "The Matrix",
    "Genre": {"Name": "Sci-fi"},
    "Director": [{"Name": "Lana Wachowski"}, {"Name": "Lilly Wachowski"}],
    "Country": {"Name": "U.S.A"}
  },

  {
    "Title": "Inception",
    "Genre": {"Name": "Action"},
    "Director": {"Name": "Christopher Nolan"},
    "Country": {"Name": "U.S.A"}
  },

  {
    "Title": "The Equalizer",
    "Genre": {"Name": "Action"},
    "Director": {"Name": "Harry Gregson-Williams"},
    "Country": {"Name": "U.S.A"}
  },

  {
    "Title": "12 Years A Slave",
    "Genre": {"Name": "Drama"},
    "Director": {"Name": "Steve McQueen"},
    "Country": {"Name": "U.S.A"}
  },
];*/

//route url - Home page
app.get('/', (req, res) => {
  res.send('Welcome to my Movie app');
});

// serving documentation - express.static
app.get('/documentation', (req, res) => {
    res.sendFile(__dirname, 'documentation.html');
});

//get all users
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
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
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(reg.body.Username + 'already exists');
  } else {
    Users
      .create({
        Username: req.body.Username,
        Password: req.body.Password,
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

//User updates - updating user name
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.body.Username },
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
      res.status(500).send('Error ' + err)
    } else {
    res.json(updatedUser);
    }
  });
});

//deleting user account
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.body.Username })
    .then((user) => {
      if (!user) {
        res.status(200).send(req.params.Username + ' was deleted succesfully.');
      } else {
        res.status(400).send(req.params.Username + ' was not found');
      }
    })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
      });
});

//viewing movies list - json
app.get('/movies', (req, res) => {
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
app.get('/movies/:Title', (req, res) => {
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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

//retrieving movies by genre
app.get('/genre/:Name', (req, res) => {
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
app.get('/director/:Name', (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
      .then((movie) => {
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

//error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

//action listener for port 8080
app.listen(8080, () => {
  console.log('Your app is listening on Port 8080');
});
