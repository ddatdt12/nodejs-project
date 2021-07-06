const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const CourseSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    weeks: {
        type: Number,
        required: [true, 'Please add number of weeks'],
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost'],
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a description'],
        enum: ['beginner', 'intermediate', 'advanced'],
    },
    scholarhipsAvailable: {
        type: Boolean,
        default: false,
    },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
});

//Static method to get avg of course tuitions
CourseSchema.statics.getAvarageCost = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId },
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' },
            },
        },
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(
            bootcampId,
            {
                averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
            },
            { useFindAndModify: true },
        );
    } catch (err) {
        console.log(err);
    }
};

//Call getAvarageCost after save
CourseSchema.post('save', function () {
    this.constructor.getAvarageCost(this.bootcamp);
});

//Call getAvarageCost before remove
CourseSchema.post('remove', function () {
    this.constructor.getAvarageCost(this.bootcamp);
});

module.exports = mongoose.model('Course', CourseSchema);
