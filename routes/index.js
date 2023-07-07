const router = require('express').Router();

const usersRoutes = require('./users');
const moviesRoutes = require('./movies');
const routeAuth = require('./auth');

const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');

router.use('/', routeAuth);

router.use(auth);

router.use('/users', usersRoutes);
router.use('/movies', moviesRoutes);

router.use((req, res, next) => next(new NotFoundError('Page Not Found')));

module.exports = router;
