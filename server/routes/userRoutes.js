const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const authorizeRole = require('../middleware/authorizeRole');

router.use(authenticateToken);
router.get('/', authorizeRole('admin'), userController.getAllUsers);
router.post('/', authorizeRole('admin'), userController.createUser);
router.put('/:id', authorizeRole('admin'), userController.updateUser);
router.delete('/:id', authorizeRole('admin'), userController.deleteUser);

module.exports = router; 