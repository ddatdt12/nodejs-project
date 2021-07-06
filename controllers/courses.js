const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
//@desc         Get Courses
//@route        GET /api/v1/courses
//@route        GET /api/v1/bootcamps/:bootcampId/courses
//@access       Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });
    } else {
        res.status(200).json(req.advancedResults);
    }
});

//@desc         Get single Course
//@route        GET /api/v1/courses/:id
//@access       Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(
            new ErrorResponse(
                `Course not found with id of ${req.params.id}`,
                404,
            ),
        );
    }
    res.status(200).json({
        success: true,
        data: course,
    });
});
//@desc         Add new Course
//@route        POST /api/v1/bootcamps/:bootcampId/courses
//@access       PRIVATE
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(
            new ErrorResponse(`No Bootcamp with id${req.params.bootcampId} `),
            404,
        );
    }

    //Make sure user is course owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add course to this bootcamp`,
                403,
            ),
        );
    }

    const course = await Course.create(req.body);
    res.status(200).json({
        success: true,
        data: course,
    });
});

//@desc         Update Course
//@route        PUT /api/v1/courses/:id
//@access       PRIVATE
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    if (!course) {
        return next(
            new ErrorResponse(
                `Course not found with id of ${req.params.id}`,
                404,
            ),
        );
    }

    //Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to update course to this bootcamp ${req.params.bootcampId}`,
                403,
            ),
        );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        data: course,
    });
});

//@desc         Delete Course
//@route        DELETE /api/v1/courses/:id
//@access       PRIVATE
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        return next(
            new ErrorResponse(
                `Course not found with id of ${req.params.id}`,
                404,
            ),
        );
    }

    //Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `User ${req.user.id} is not authorized to add delete to this bootcamp ${req.params.bootcampId}`,
                403,
            ),
        );
    }
    await course.remove();
    res.status(200).json({
        success: true,
        data: {},
    });
});
