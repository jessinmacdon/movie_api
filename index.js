const express = require('express'),
morgan = require('morgan'),

//adding express in the app
const app = express();

//passing morgan for logging
app.use(morgan('common'));

let movies = [
  {
    'Title': "Black Panther",
    'Genres': {"names": "action", "name": "adventure"},
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


app.get('/', (reg, res) => {
  res.send('Welcome to my Movie app');
});
