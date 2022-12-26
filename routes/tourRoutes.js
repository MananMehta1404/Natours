const express = require('express');
const tourController = require('./../controllers/tourController');

const router = express.Router();

// Creating a Param Middleware -> Param middleware is a middleware that only runs for certain parameters.
router.param('id', tourController.checkId);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.createTour);  // -> Using more than one middlewares for the same request.

router
  .route('/:id')
  .get(tourController.getOneTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;


// Static Files -> The files which are in our file system.