const { Router } = require('express');
const { signup, login, refresh, logout, me, changeProfile, resetCode, handoutCode } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/rCode', handoutCode);
router.post('/reset', resetCode);
router.get('/me', authenticate, me);
router.patch('/me', authenticate, changeProfile);

module.exports = router;
