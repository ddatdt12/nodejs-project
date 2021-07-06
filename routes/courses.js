const express = require('express');
const {
    getCourses,
    addCourse,
    getCourse,
    updateCourse,
    deleteCourse,
} = require('../controllers/courses');

const { protect, authorize } = require('../middlewares/auth');

const Course = require('../models/Course');
const advancedResults = require('../middlewares/advancedResults');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(
        advancedResults(Course, {
            path: 'bootcamp',
            select: 'name description',
        }),
        getCourses, 
    )
    .post(protect, authorize('admin', 'publisher'), addCourse);
router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('admin', 'publisher'), updateCourse)
    .delete(protect, authorize('admin', 'publisher'), deleteCourse);

module.exports = router;
