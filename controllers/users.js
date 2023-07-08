const jsonwebtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { JWT_SECRET } = require('../configs/main');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');

module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        throw new ConflictError('User with this email address already exists');
      } else {
        return bcrypt.hash(password, 10);
      }
    })
    .then((hash) => User.create({ email, name, password: hash }))
    .then((user) => {
      const newUser = {
        email: user.email,
        name: user.name,
        _id: user._id,
      };
      res.status(201).send(newUser);
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('User with this email address already exists'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Invalid data'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new UnauthorizedError('Unauthorized'),
        );
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new UnauthorizedError('Unauthorized'),
          );
        }
        const token = jsonwebtoken.sign(
          { _id: user._id },
          JWT_SECRET,
          { expiresIn: '7d' },
        );
        return res
          .cookie('jwt', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 3600000,
          })
          .status(200)
          .end();
      });
    })
    .catch(next);
};

module.exports.signout = (req, res) => {
  res
    .status(200)
    .clearCookie('jwt', {
      secure: true,
      sameSite: 'none',
    })
    .send({ message: 'Signout' });
};

module.exports.getUser = (req, res, next) => {
  const { _id } = req.user;
  return User.findById(_id)
    .orFail(new NotFoundError(`User with specified id:${_id} not found`))
    .then((user) => res.status(200).send(user))
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { _id } = req.user;
  const { email, name } = req.body;
  return User.findOne({ email })
    .then((user) => {
      if (user && user._id.toString() !== _id) {
        throw new ConflictError('User with this email address already exists');
      } else {
        return User.findByIdAndUpdate(
          _id,
          { email, name },
          { new: true, runValidators: true },
        ).orFail(
          new NotFoundError(`User with specified id:${_id} not found`),
        );
      }
    })
    .then((user) => res.status(200).send(user))
    .catch(next);
};
