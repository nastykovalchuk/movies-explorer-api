const router = require('express').Router();
const { login, createUser, signout } = require('../controllers/users');
const { validateSignIn, validateSignUp } = require('../middlewares/validation');

router.post('/signin', validateSignIn, login);
router.post('/signup', validateSignUp, createUser);
router.post('/signout', signout);

module.exports = router;
