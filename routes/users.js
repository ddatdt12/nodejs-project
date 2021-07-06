const express = require('express');

const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    createUser,
} = require('../controllers/users');
const advancedResults = require('../middlewares/advancedResults');
const User = require('../models/User');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);

router.route('/:userId').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
