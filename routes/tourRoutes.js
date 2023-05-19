const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// Nested Routes with Express
router.use('/:tourId/reviews', reviewRouter);  // This is called mounting the router.

// Aliasing
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);  // Route for top 5 cheap tours 

// Aggregation Pipeline
router
  .route('/tour-stats')
  .get(tourController.getTourStats);  // Route for tour stats

router
  .route('/monthly-plan/:year')
  .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);  // Route for monthly plan

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);  // Route for tours within a certain range of distance

router
  .route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);  // Route for calculating distances from a certain point.

router
  .route('/')
  .get(tourController.getAllTours)  // Get all tours route
  .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);  // Create tour route

router
  .route('/:id')
  .get(tourController.getTour)   // Get tour route
  .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.updateTour)  // Update tour route
  .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);  // Delete tour route

// Exporting the router
module.exports = router;