const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");

// ******************************************** Handler Functions ********************************************* 

// Function to alias the top 5 tours
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

// Function handling the get() request of all the tours.
exports.getAllTours = factory.getAll(Tour);

// Function handling the get() request to get a specific tour from all the tours.
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// Function handling the post() request to create a new tour in the tours collection.
exports.createTour = factory.createOne(Tour);


// Function handling the update() request to update a specific tour in the tours data.
exports.updateTour = factory.updateOne(Tour);

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

// Function to get the tours within a certain distance
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;  // distance: 233, latlng: 34.111745,-118.113491, unit: mi
    const [lat, lng] = latlng.split(',');  // lat: 34.111745, lng: -118.113491

    // The radius of the earth is 3963.2 miles and 6378.1 kilometers.
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;  // radius: 0.037

    if(!lat || !lng) {   
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }  // $geoWithin: { $centerSphere: [[lng, lat], radius] } means that we want to find all the tours within a certain distance from a certain point.
    });

    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;  // latlng: 34.111745,-118.113491, unit: mi
    const [lat, lng] = latlng.split(',');  // lat: 34.111745, lng: -118.113491

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;  // multiplier: 0.000621371

    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]  // lng * 1 and lat * 1 are used to convert the string values to numbers.
                },
                distanceField: 'distance',  // distanceField: 'distance' means that we want to add a new field called distance to the document.
                distanceMultiplier: multiplier  // distanceMultiplier: multiplier means that we want to multiply the distance value by the multiplier.
            }
        },
        {
            $project: {
                distance: 1,  // distance: 1 means that we want to include the distance field in the result.
                name: 1  // name: 1 means that we want to include the name field in the result.
            }
        }
    ]);

    res.status(200).json({
        status: "success",
        data: {
            data: distances
        }
    });
});

// Here all the handler functions are in the exports object.