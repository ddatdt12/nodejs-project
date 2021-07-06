const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    //Make sure token exits
    if (!token) {
        return next(new ErrorResponse('Not authorized to access', 401));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorResponse("The user doesn't exit", 400));
        }
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorize to access', 401));
    }
};

exports.authorize = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role: ${req.user.role} not authorized to access`,
                    403,
                ),
            );
        }
        next();
    };
};
