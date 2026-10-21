const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authSessionService = require('../services/authSession.service');

function signToken(id) {
  return jwt.sign({ sub: id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
}

async function login(req, res) {
  const sentVars = req.body.split(":")
  if(sentVars.length != 2){
	res.status(402).send('Incorrect request');
  }
  const email = sentVars[0];
  const password = sentVars[1];
  const errors = [];

  if (!email) errors.push('email is required');
  if (!password) errors.push('password is required');
  if (errors.length) return res.status(400).send(errors.join("\r\n"));

  const user = await prisma.administrator.findUnique({ where: { email } });
  if (!user) return res.status(401).send('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send('Invalid credentials' );

  const token = signToken(user.id);
  console.log(user)

  res.send(token + ':' + user.id + ':' + user.email);
}

async function refresh(req, res) {
  const { sessionToken } = req.body;
  if (!sessionToken) return res.status(400).json({ error: 'sessionToken is required' });

  const session = await authSessionService.validateAuthSession(sessionToken);
  if (!session) return res.status(401).json({ error: 'SESSION_EXPIRED' });

  const user = await model.findUnique({
    where: { id: session.userId },
    omit: { password: true },
  });
  if (!user) return res.status(401).json({ error: 'SESSION_EXPIRED' });

  const token = signToken(user.id, session.userRole);
  res.json({ token, user: { ...user } });
}

async function logout(req, res) {
  const sessionToken = req.body;
  if (sessionToken) {
    await authSessionService.deleteAuthSession(sessionToken);
  }
  res.send('Logged out successfully');
}

module.exports = {login, refresh, logout};
