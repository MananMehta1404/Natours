const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

// ******************************************** Handler Functions *********************************************

// Function handling the get() request of all the reviews.
exports.getAllReviews = factory.getAll(Review);

// Middleware to set the tour and user ids before creating a new review.
exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
};

// Function handling the get() request to get a specific review from all the reviews.
exports.getReview = factory.getOne(Review);

// Function handling the post() request to create a new review in the reviews collection.
exports.createReview = factory.createOne(Review);

// Function handling the update() request to update a specific tour in the tours data.
exports.updateReview = factory.updateOne(Review);

// Function handling the delete() request to delete a specific review from the reviews collection.
exports.deleteReview = factory.deleteOne(Review);
