const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const ReviewSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title for review'],
        trim: true,
        maxlength: 100,
    },
    text: {
        type: String,
        required: [true, 'Please add some text'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10'],
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

ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//Static method to get avg of review ratings
ReviewSchema.statics.getAvarageRating = async function (bootcampId) {
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId },
        },
        {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' },
            },
        },
    ]);
    console.log(obj);
    try {
        await this.model('Bootcamp').findByIdAndUpdate(
            bootcampId,
            {
                averageRating: obj[0].averageRating,
            },
            { useFindAndModify: true },
        );
    } catch (err) {
        console.log(err.red);
    }
};

//Call getAvarageRating after save
ReviewSchema.post('save', function () {
    this.constructor.getAvarageRating(this.bootcamp);
});

//Call getAvarageRating after update if rating is modified
ReviewSchema.post('findOneAndUpdate', async function () {
    const review = await this.model.findById(this.getQuery());
    if (this._update['$set'].rating) {
        this.model.getAvarageRating(review.bootcamp);
    }
});

//Call getAvarageRating before remove
ReviewSchema.post('remove', function () {
    this.constructor.getAvarageRating(this.bootcamp._id);
});

module.exports = mongoose.model('Review', ReviewSchema);
