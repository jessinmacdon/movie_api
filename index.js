const express = require('express'),
morgan = require('morgan'),

//adding express in the app
const app = express();

//passing morgan for logging
app.use(morgan('common'));


app.get('/', (reg, res) => {
  res.send('Welcome to my Movie app');
});
