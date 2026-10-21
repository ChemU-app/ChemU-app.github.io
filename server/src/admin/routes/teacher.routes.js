const { Router } = require('express');
const { editTeacher, modifyTeacher, getTeachers } = require('../controllers/teacher.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

router.post('/edit', editTeacher);
router.post('/modify', modifyTeacher);
router.post('/get', getTeachers);

module.exports = router;

