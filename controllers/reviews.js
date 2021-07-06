const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

//@desc         Get reviews
//@route        GET /api/v1/reviews
//@route        GET /api/v1/bootcamps/:bootcampId/reviews
//@access       Public
exports.getReviews = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const reviews = await Review.find({
            bootcamp: req.params.bootcampId,
        }).populate({
            path: 'user',
            select: 'email',
        });
        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } else {
        res.status(200).json(req.advancedResults);
    }
});

//@desc         Get single review
//@route        GET /api/v1/reviews/:id
//@access       Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description',
    });
    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`));
    }

    res.status(200).json({ success: true, data: review });
});

//@desc         Create review for bootcamp
//@route        POST /api/v1/bootcamps/:bootcampId/reviews
//@access       Public
exports.addReview = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);
    if (!bootcamp) {
        return next(
            new ErrorResponse(`Bootcamp with id ${req.params.id} not found`),
        );
    }
    req.body.user = req.user.id;
    req.body.bootcamp = req.params.bootcampId;
    const review = await Review.create(req.body);

    res.status(200).json({ success: true, data: review });
});

//@desc         Update review
//@route        PUT /api/v1/reviews/:id
//@access       PRIVATE
exports.updateReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id);
    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`));
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with id ${req.user.id} not authorized to update review`,
            ),
        );
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        useFindAndModify: true,
        runValidators: true,
    });
    res.status(200).json({ success: true, data: review });
});

//@desc         DELTE review
//@route        DELETE /api/v1/reviews/:id
//@access       PRIVATE
exports.deleteReview = asyncHandler(async (req, res, next) => {
    let review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'user',
    });
    if (!review) {
        return next(new ErrorResponse(`No review with id ${req.params.id}`));
    }
    console.log(review);
    const isAuthorized =
        review.user.toString() === req.user.id ||
        req.user.role === 'admin' ||
        req.user.id === review.bootcamp.user.toString();
    if (!isAuthorized) {
        return next(
            new ErrorResponse(
                `The user with id ${req.user.id} not authorized to delete review`,
            ),
        );
    }

    await review.remove();
    res.status(200).json({ success: true, data: {} });
});
