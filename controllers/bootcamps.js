const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

//@desc         Get all Bootcamps
//@route        GET /api/v1                                                                                                                                         /bootcamps
//@access       Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(req.advancedResults);
});

//@desc         Get single Bootcamps
//@route        GET /api/v1/bootcamps/:id
//@access       Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404,
            ),
        );
    }

    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

//@desc         Create new Bootcamp
//@route        POST /api/v1/bootcamps
//@access       Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    //Add user to req.Body
    req.body.user = req.user.id;

    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });
    //if user is publisher, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user with ${req.user.id} has already published a bootcamp `,
                400,
            ),
        );
    }

    const data = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data });
});

//@desc         Update Bootcamps
//@route        PUT /api/v1/bootcamps/:id
//@access       Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404,
            ),
        );
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user ${req.user.id} is not authorized to update this bootcamp`,
                403,
            ),
        );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});
//@desc         Delete Bootcamp
//@route        GET /api/v1/bootcamps/:id
//@access       PRIVATE
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404,
            ),
        );
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user ${req.user.id} is not authorized to delete this bootcamp`,
                403,
            ),
        );
    }

    bootcamp.remove();

    res.status(200).json({
        success: true,
        data: {},
    });
});

//@desc         Upload photo for Bootcamp
//@route        PUT /api/v1/bootcamps/:id/photo
//@access       PRIVATE
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(
            new ErrorResponse(
                `Bootcamp not found with id of ${req.params.id}`,
                404,
            ),
        );
    }

    //Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(
                `The user ${req.user.id} is not authorized to delete this bootcamp`,
                403,
            ),
        );
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file!`, 400));
    }

    const file = req.files.file;
    //Make sure the image is a photo
    if (!file.mimetype.startsWith('image/')) {
        return next(new ErrorResponse(`Please upload a photo file!`, 400));
    }

    //Check filesize
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload a image less than ${process.ENV.MAX_FILE_UPLOAD}!`,
                400,
            ),
        );
    }

    //Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
    console.log(req.files);

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
            return next(new ErrorResponse(`Problem with upload file`, 500));
        }
        await Bootcamp.findByIdAndUpdate(
            req.params.id,
            { photo: file.name },
            { useFindAndModify: false },
        );
        res.status(200).json({
            success: true,
            data: file.name,
        });
    });
});
