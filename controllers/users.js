const User = require('../models/User');
const asyncHandler = require('../middlewares/async');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

//@desc         Get all users
//@route        GET /api/v1/users
//@access       PRIVATE/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(req.advancedResults);
});

//@desc         Get single user
//@route        GET /api/v1/users/:userId
//@access       PRIVATE/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
        return next(
            new ErrorResponse(
                `User with id ${req.params.userId} not found`,
                404,
            ),
        );
    }
    res.status(200).json({
        success: true,
        data: user,
    });
});

//@desc         Create user
//@route        POST /api/v1/users
//@access       PRIVATE/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user,
    });
});
//@desc         Delete user
//@route        DELETE /api/v1/users/:userId
//@access       PRIVATE/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    let user = await User.findById(req.params.userId);
    if (!user) {
        return next(
            new ErrorResponse(
                `User with id ${req.params.userId} not found`,
                404,
            ),
        );
    }

    await user.remove();

    res.status(200).json({
        success: true,
        data: {},
    });
});
//@desc         Update user
//@route        PUT /api/v1/users/:userId
//@access       PRIVATE/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    let user = await User.findByIdAndUpdate(req.params.userId, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: true,
    });
    if (!user) {
        return next(
            new ErrorResponse(
                `User with id ${req.params.userId} not found`,
                404,
            ),
        );
    }

    res.status(200).json({
        success: true,
        data: user,
    });
});
