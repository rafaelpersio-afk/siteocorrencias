// Authentication middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = 'your_secret_key';

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

module.exports = { verifyToken };