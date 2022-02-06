const express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
uuid = require('uuid');

//passing/invoking express iin the app
const app = express();

//passing/invoking morgan for logging
app.use(morgan('common'));

//passing/invoking body-paser
app.use(bodyParser.json());

//using express.static to display documentation.html file
app.use(express.static('/public'));

//adding users / in-memory
let users = [
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
];

// serving documentation - express.static
app.get('/documentation', (req, res) => {
    res.sendFile(__dirname, 'documentation.html');
});

//creating new users - signup
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).json(newUser)
  } else {
    res.status(400).send('Please add a username')
  }
})

//User updates - updating user name
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id );

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('user not found');
  }
})

//deleting user account
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send('Your user account has been deleted')
  } else {
    res.status(400).send('user not found');
  }
})

//user adding new movie to their list of favourite movies
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favouriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to your favourite movies`);
  } else {
    res.status(400).send('user not found');
  }
})

//user removing movies from their favourite movies list
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id );

  if (user) {
    user.favouriteMovies.filter(title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from your favourite movies`)
  } else {
    res.status(400).send('user not found');
  }
})

//route url - Home page
app.get('/', (req, res) => {
  res.send('Welcome to my Movie app');
});

//viewing movies list - json
app.get('/movies', (req, res) => {
  res.status(200).json(topMovies);
});

// gets all movies - Title
app.get('/movies/:title', (req, res) => {
  const title = req.params.title;
  const movie = topMovies.find( movie => movie.Title === title);

  if (title) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('Movie not found!')
  }
})

//retrieving movies by genre
app.get('/movies/genre/:genreName', (req, res) => {
  const genreName = req.params;
  const genre = topMovies.find( movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('Genre not found!')
  }
})

//retrieving director information
app.get('/movies/director/:directorName', (req, res) => {
  const { directorName } = req.params;
  const director = topMovies.find( movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('Director not found!')
  }
})

//error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

//action listener for port 8080
app.listen(8080, () => {
  console.log('Your app is listening on Port 8080');
});
