const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");

// ******************************************** Handler Functions *********************************************

// Function handling the get() request of all the reviews.
exports.getAllReviews = catchAsync(async (req, res, next) => {

    const reviews = await Review.find();

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

// Function handling the post() request to create a new review in the reviews collection.
exports.createReview = catchAsync(async (req, res, next) => {
    
    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});
