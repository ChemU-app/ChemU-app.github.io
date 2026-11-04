const { Router } = require('express');
const { editStudent, modifyStudent, getStudents } = require('../controllers/student.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.post('/edit', editStudent);
router.post('/modify', modifyStudent);
router.post('/get', getStudents);

module.exports = router;

