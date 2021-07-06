const express = require('express');

const {
    getBootcamps,
    getBootcamp,
    updateBootcamp,
    createBootcamp,
    deleteBootcamp,
    bootcampPhotoUpload,
} = require('../controllers/bootcamps');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middlewares/advancedResults');

//Include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

//Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('admin', 'publisher'), createBootcamp);
router
    .route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('admin', 'publisher'), updateBootcamp)
    .delete(protect, authorize('admin', 'publisher'), deleteBootcamp);

router
    .route('/:id/photo')
    .put(protect, authorize('admin', 'publisher'), bootcampPhotoUpload);
module.exports = router;
