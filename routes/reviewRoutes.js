const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });  // mergeParams: true is used to get access to the tourId parameter from the tour routes.

// ******************************************** Review Routes *********************************************

// Protect all routes after this middleware
router.use(authController.protect);

router.route('/')
    .get(reviewController.getAllReviews)  // Get all reviews route
    .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.createReview);  // Create review route

router.route('/:id')
    .get(reviewController.getReview)  // Get review route
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview)  // Update review route
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview);  // Delete review route

// Exporting the router
module.exports = router;