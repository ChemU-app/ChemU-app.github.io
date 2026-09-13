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

const allowedOrigins=[
 "https://chemu-app.github.io/"
];

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin header.
    // This includes many native React Native/Expo requests and server-to-server calls.
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },

  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,

  // Set this to true only if you use cookies for authentication.
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

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

module.exports = app;
