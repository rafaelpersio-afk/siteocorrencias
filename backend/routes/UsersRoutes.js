// Users routes
const express = require('express');
const UsersController = require('../controllers/UsersController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/users
router.get('/', UsersController.getUsers);

// POST /api/users
router.post('/', UsersController.createUser);

// PUT /api/users/:id/status
router.put('/:id/status', UsersController.updateUserStatus);

// PUT /api/users/:id/role
router.put('/:id/role', UsersController.updateUserRole);

module.exports = router;