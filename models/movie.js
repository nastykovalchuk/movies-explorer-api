const mongoose = require('mongoose');
const validator = require('validator');

const movieSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    validate: {
      validator: (url) => validator.isURL(url),
      message: 'Enter correct URL',
    },
    required: true,
  },
  trailerLink: {
    type: String,
    validate: {
      validator: (url) => validator.isURL(url),
      message: 'Enter correct URL',
    },
    required: true,
  },
  thumbnail: {
    type: String,
    validate: {
      validator: (url) => validator.isURL(url),
      message: 'Enter correct URL',
    },
    required: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  movieId: {
    type: Number,
    required: true,
  },
  nameRU: {
    type: String,
    required: true,
  },
  nameEN: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('movie', movieSchema);
