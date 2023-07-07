const Movie = require('../models/movie');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.status(200).send(movies))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  return Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Invalid data'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;
  return Movie.findById(movieId)
    .orFail(new NotFoundError(`Movie with specified id:${movieId} not found`))
    .then((movie) => {
      if (movie) {
        const owner = movie.owner.toString();
        if (owner === req.user._id) {
          return Movie.deleteOne(movie);
        }
        return Promise.reject(new ForbiddenError('Access denied'));
      }
      return Promise.reject(new NotFoundError('Movie not found'));
    })
    .then(() => res.status(200).send({ message: 'Movie removed' }))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Invalid data'));
      }
      return next(err);
    });
};
