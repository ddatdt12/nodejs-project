const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    //Log to console for dev
    console.log(err);
    let error = { ...err };
    error.message = err.message;

    //Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found `;
        error = new ErrorResponse(message, 404);
    }

    //Mongoose duplicate key
    if (err.code === 11000) {
        const message = `Duplicate field value entered`;
        error = new ErrorResponse(message, 404);
    }

    //Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((e) => e.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server error',
    });
};

module.exports = errorHandler;
