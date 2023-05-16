const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");


// ******************************************** Handler Functions ********************************************* 

// Function to alias the top 5 tours
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

// Function handling the get() request of all the tours.
exports.getAllTours = catchAsync(async (req, res, next) => {

    // Building the query
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    // Executing the query
    const tours = await features.query;

    // Send Response
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});

// Function handling the get() request to get a specific tour from all the tours.
exports.getOneTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findById(req.params.id).populate('reviews');
    // Tour.findById(req.params.id) == Tour.findOne({ _id: req.params.id }) (In MongoDB)

    if(!tour){
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

// Function handling the post() request to create a new tour in the tours collection.
exports.createTour = catchAsync(async (req, res, next) => {

    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    });
});


// Function handling the update() request to update a specific tour in the tours data.
exports.updateTour = catchAsync(async (req, res, next) => {

    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!tour){
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            tour
        }
    });
});

// Function handling the delete() request to delete a specific tour from the tours data.
exports.deleteTour = factory.deleteOne(Tour);

// Function to get the tour statistics
exports.getTourStats = catchAsync(async (req, res, next) => {

    // Aggregation Pipeline
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }  // $match: { ratingsAverage: { $gte: 4.5 } } means that we want to match all the documents where the ratingsAverage value is greater than or equal to 4.5.
        },
        {
            $group: {
                // _id: null, // _id: null means that we want to group all the documents together.
                // _id: '$difficulty', // _id: '$difficulty' means that we want to group all the documents by the difficulty field.

                _id: { $toUpper: '$difficulty' },  // $toUpper: '$difficulty' means that we want to convert the difficulty values to uppercase in the group.
                numTours: { $sum: 1 },  // $sum: 1 means that we want to count the number of documents in the group.
                numRatings: { $sum: '$ratingsQuantity' },  // $sum: '$ratingsQuantity' means that we want to sum up all the ratingsQuantity values in the group.
                avgRating: { $avg: '$ratingsAverage' },  // $avg: '$ratingsAverage' means that we want to calculate the average of all the ratingsAverage values in the group.
                avgPrice: { $avg: '$price' },  // $avg: '$price' means that we want to calculate the average of all the price values in the group.
                minPrice: { $min: '$price' },  // $min: '$price' means that we want to calculate the minimum of all the price values in the group.
                maxPrice: { $max: '$price' }  // $max: '$price' means that we want to calculate the maximum of all the price values in the group.
            }
        },
        {
            $sort: { avgPrice: 1 }  // 1 means ascending order and -1 means descending order.
        },
        // {
        //     $match: { _id: { $ne: 'EASY' } }  // $ne: 'EASY' means that we want to exclude the EASY group from the result.
        // }
        
    ]);

    res.status(200).json({  
        status: "success",
        data: {
            stats
        }
    });
});

// Function to get the monthly plan
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;  // 2021

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'  // $unwind: '$startDates' means that we want to create a new document for each element in the startDates array.
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),  // $gte: new Date(`${year}-01-01`) means that we want to match all the documents where the startDates value is greater than or equal to the start of the year.
                    $lte: new Date(`${year}-12-31`)  // $lte: new Date(`${year}-12-31`) means that we want to match all the documents where the startDates value is less than or equal to the end of the year.
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },  // $month: '$startDates' means that we want to group all the documents by the month of the startDates value.
                numTourStarts: { $sum: 1 },  // $sum: 1 means that we want to count the number of documents in the group.
                tours: { $push: '$name' }  // $push: '$name' means that we want to push all the name values in the group.
            }
        },
        {
            $addFields: { month: '$_id' }  // $addFields: { month: '$_id' } means that we want to add a new field called month to the group.
        },
        {
            $project: {
                _id: 0  // _id: 0 means that we want to exclude the _id field from the result.
            }
        },
        {
            $sort: { numTourStarts: -1 }  // -1 means descending order.
        },
        {
            $limit: 12  // $limit: 12 means that we want to limit the number of documents in the result to 12.
        }
    ]);

    res.status(200).json({
        status: "success",
        data: {
            plan
        }
    });
});

// Here all the handler functions are in the exports object.