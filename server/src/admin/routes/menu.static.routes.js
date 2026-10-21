const { Router } = require('express');
const { login, base, logout } = require('../controllers/menu.static.controller');
//const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.post('/base', base);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;

