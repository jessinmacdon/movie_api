const express = require('express'),
morgan = require('morgan');

//passing/invoking express iin the app
const app = express();

//passing morgan for logging
app.use(morgan('common'));

//adding top movies list(array)
let topMovies = [
  {
    'Title': "Black Panther",
    'Genres': {"name": "action", "name": "adventure"},
    'Director': {"name": 'Ryan Coogler'},
    'Country': {"name": "U.S.A"},
  },

  {
    'Title': "The Avengers Series",
    'Genres': {"name": "action", "name": "sci-fi"},
    'Director': {"name": "Kevin Feige"},
    'Country': {"name": "U.S.A"},
  },

  {
    'Title': "Star Wars",
    'Genres': {"name": "sci-fi"},
    'Director': {"name": "George Lucas"},
    'Country': {"name": "U.S.A"},
  },

  {
    'Title': "The Dark Knight",
    'Genres': {"name": "action", "name": "adventure"},
    'Director': {"name": "Christopher Nolan"},
    'Country': {"name": "U.S.A"},
  },

  {
    'Title': "The Matrix",
    'Genres': {"name": "sci-fi", "name": "action"},
    'Director': {"name": "Lana Wachowski", "name": "Lilly Wachowski"},
    'Country': {"name": "U.S.A"},
  },

  {
    'Title': "Inception",
    'Genres': {"name": "action", "name": "sci-fi"},
    'Director': {"name": "Christopher Nolan"},
    'Country': {"name": "U.S.A"},
  },

  {
    'Title': "The Equalizer",
    'Genres': {"name": "action", "name": "thriller"},
    'Director': {"name": "Harry Gregson-Williams"},
    'Country': {"name": "U.S.A"},
  },

  {
    'Title': "12 Years A Slave",
    'Genres': {"name": "drama", "name": "history"},
    'Director': {"name": "Steve McQueen"},
    'Country': {"name": "U.S.A"},
  },
];

//route url - Home page
app.get('/', (reg, res) => {
  res.send('Welcome to my Movie app');
});

//viewing movies list - json
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

//using express.static to display documentation.html file
app.use(express.static('public'));

//error handler
app.use((err, req, res, next) => {
  cosole.error(err.stack);
  res.status(500).send('Something went wrong!');
});

//action listener for port 8080
app.listen(8080, () => {
  console.log('Your app is listening on Port 8080');
});
