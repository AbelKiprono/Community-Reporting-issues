const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidator');
const { verifyJWT } = require('../middleware/auth');

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', verifyJWT, me);

module.exports = router;