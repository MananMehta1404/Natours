const Tour = require("../models/tourModel");


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

        console.log(req.query);

        // First we build the query

        // 1A) Filtering

        // Creating a hard copy of the req.query object
        const queryObj = {...req.query};
        // Storing the excluded fields in an array
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // Deleting the excluded fields from the queryObj
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced Filtering

        // Converting the object into the string
        let queryStr = JSON.stringify(queryObj);
        // Replacing the string with the $ before match
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}` );
        // console.log(JSON.parse(queryStr));

        // Standard way of writing a query in MongoDB -> { difficulty: 'easy', duration: { $gte: 5 } }
        // What we got from the req.query object ->      { difficulty: 'easy', duration: { gte: '5' } }

        let query = Tour.find(JSON.parse(queryStr));

        // Simplest way of writing a query
        // const query = Tour.find(req.query);

        // Writing a query using Mongoose methods
        // const query = Tour.find().where('duration').equals(5).where('difficulty').equals('easy');

        // 2) Sorting

        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ');
            // console.log(sortBy);
            query = query.sort(sortBy);
            // sort(price ratingsAverage)
        }
        else{
            query = query.sort('-createdAt');
        }

        // 3) Fields Limiting

        // Selecting the fields to be returned
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
            // select(name duration difficulty)
        }
        else{
            query = query.select('-__v');
        }
        
        // 4) Pagination

        const page = req.query.page * 1 || 1;  // Converting the string to number and if it is undefined then setting it to 1 (default page)
        const limit = req.query.limit * 1 || 100;  // Converting the string to number and if it is undefined then setting it to 100 (default limit)
        const skip = (page - 1) * limit;  // Calculating the number of documents to be skipped

        query = query.skip(skip).limit(limit);  // Skipping the documents and limiting the number of documents to be returned

        // If the page number is greater than the number of pages then throw an error
        if(req.query.page){
            const numTours = await Tour.countDocuments();
            if(skip >= numTours) throw new Error('This page does not exist');
        }



        // Second we Execute the query
        const tours = await query;


        // Third we Send the Response
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