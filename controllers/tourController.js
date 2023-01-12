const Tour = require("../models/tourModel");


// ******************************************** Handler Functions ********************************************* 

// Function handling the get() request of all the tours.
exports.getAllTours = (req, res) => {
    console.log(req.requestTime);

    // We send the data in the Jsend data format of the JSON.
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        // results: tours.length,
        // data: {
        //     tours
        // }
    });
};

// Function handling the get() request to get a specific tour from all the tours.
exports.getOneTour = (req, res) => {
    // To read the parameters
    console.log(req.params);

    // const id = req.params.id * 1;
    // const tour = tours.find(el => el.id === id);  // For finding the tour with the given id.
            
    res.status(200).json({
        status: 'success',
        // data: {
        //     tour
        // }
    });
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
exports.updateTour = (req, res) => {
    res.status(200).json({
        status: "success",
        data: {
            tour: '<Updated tour here...>'
        }
    });
};

// Function handling the delete() request to delete a specific tour from the tours data.
exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: "success",
        data: null
    });
};

// Here all the handler functions are in the exports object.