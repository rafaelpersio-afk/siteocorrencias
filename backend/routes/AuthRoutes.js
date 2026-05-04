// Auth routes
const express = require('express');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// POST /api/auth/login
router.post('/login', AuthController.login);

// POST /api/auth/register
router.post('/register', AuthController.register);

module.exports = router;