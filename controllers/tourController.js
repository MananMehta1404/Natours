const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");


// ******************************************** Handler Functions ********************************************* 

// Function to alias the top 5 tours
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

// Function handling the get() request of all the tours.
exports.getAllTours = async (req, res) => {

    try{

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
    }
    catch(err){
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
};

// Function handling the get() request to get a specific tour from all the tours.
exports.getOneTour = async (req, res) => {

    try{
        const tour = await Tour.findById(req.params.id);
        // Tour.findById(req.params.id) == Tour.findOne({ _id: req.params.id }) (In MongoDB)

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    }
    catch(err){
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
};

// Function handling the post() request to create a new tour in the tours collection.
exports.createTour = async (req, res) => {

    // Handling errors that may occur due to validation
    try{
        // const newTour = new Tour({});
        // newTour.save();

        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        });
    } 
    catch (err) {
        res.status(400).json({
            status: "fail",
            message: "Invalid data sent"
        });
    }
};


// Function handling the update() request to update a specific tour in the tours data.
exports.updateTour = async (req, res) => {

    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            status: "success",
            data: {
                tour
            }
        });
    }
    catch(err){
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
};

// Function handling the delete() request to delete a specific tour from the tours data.
exports.deleteTour = async (req, res) => {

    try{
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: "success",
            data: null
        });
    }
    catch(err){
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
};

// Here all the handler functions are in the exports object.