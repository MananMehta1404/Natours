const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,  // This is the type of the ID of the tour document in the tours collection.
        ref: 'Tour',  // This is the reference to the tour document in the tours collection.
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,  // This is the type of the ID of the user document in the users collection.
        ref: 'User',  // This is the reference to the user document in the users collection.
        required: [true, 'Review must belong to a user.']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ******************************************** Query Middleware *********************************************

// This query middleware is used to populate the tour and user fields in the review document.
reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next();
});

// ******************************************** Static Methods *********************************************

// This static method is used to calculate the average rating of a tour.
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    // 'this' points to the current model.
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',  // This is the field by which we want to group the documents.
                nRating: { $sum: 1 },  
                avgRating: { $avg: '$rating' }  
            }
        }
    ]);

    // console.log(stats);

    // Update the tour document with the new average rating.
    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } 
    else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

// ******************************************** Document Middleware *********************************************

// This document middleware is used to calculate the average rating of a tour after a new review is created.
reviewSchema.post('save', function() {
    // 'this' points to the current review document.
    this.constructor.calcAverageRatings(this.tour);
});

// ******************************************** Query Middleware *********************************************

reviewSchema.pre(/^findOneAnd/, async function(next) {
    // 'this' points to the current query.
    this.r = await this.findOne();  // We need to save the current review document in the query to use it in the post middleware.  
    // console.log(this.r);
    next();
});

// This query middleware is used to calculate the average rating of a tour after a review is updated or deleted.
reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne();  // This will not work here, because the query has already executed.
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

// Creating a model from the reviewSchema.
const Review = mongoose.model('Review', reviewSchema);

// Exporting the Review model.
module.exports = Review;