const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const chapterRoutes = require('./routes/chapter.routes');
const sectionRoutes = require('./routes/section.routes');
const questionRoutes = require('./routes/question.routes');
const studyRoutes = require('./routes/study.routes');
const rewardRoutes = require('./routes/reward.routes');
const redemptionRoutes = require('./routes/redemption.routes');
const studentRoutes = require('./routes/student.routes');
const tagRoutes = require('./routes/tag.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
const path = require("node:path");
app.set("views", path.join(__dirname, "views"));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/redemptions', redemptionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/stats', statsRoutes);

// Admin:

const adminAuthRoutes = require('./admin/routes/auth.routes')
const adminStaticTeacherRoutes = require('./admin/routes/teacher.routes')

const adminStaticMenuRoutes = require('./admin/routes/menu.static.routes')

app.use('/admin/menu', adminStaticMenuRoutes);
app.use('/admin/teacher', adminStaticTeacherRoutes);
//app.use('/api/admin/auth', adminAuthRoutes);
//app.use('/api/admin/teacher', adminTeacherRoutes);
//app.use('/api/admin/student');
//app.use('/api/admin/course');


module.exports = app;
