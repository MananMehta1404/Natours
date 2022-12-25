const fs = require('fs');

// Reading the tours data synchronously.
const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


// ******************************************** Handler Functions ********************************************* 

// Function handling the get() request of all the tours.
exports.getAllTours = (req, res) => {
    console.log(req.requestTime);

    // We send the data in the Jsend data format of the JSON.
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: tours.length,
        data: {
            tours
        }
    });
};

// Function handling the get() request to get a specific tour from all the tours.
exports.getOneTour = (req, res) => {
    // To read the parameters
    console.log(req.params);

    const id = req.params.id * 1;

    // First Approach if the user enters a wrong id
    // if(id >= tours.length){

    // Alternate approach
    const tour = tours.find(el => el.id === id);  // For finding the tour with the given id.
    if(!tour){
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
};

// Function handling the post() request to create a new tour in the tours data.
exports.createTour = (req, res) => {
    // console.log(req.body);

    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);

    // Pushing the newTour to the tours array.
    tours.push(newTour);

    // Over writing the tours-simple.json file with the new tours array so that the newTour gets added to it.
    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        });
    });

    // We cannot send two responses at the same time.
    // res.send('Done');
};

// Function handling the update() request to update a specific tour in the tours data.
exports.updateTour = (req, res) => {
    const id = req.params.id * 1;
    if(id >= tours.length){
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        });
    }

    res.status(200).json({
        status: "success",
        data: {
            tour: '<Updated tour here...>'
        }
    });
};

// Function handling the delete() request to delete a specific tour from the tours data.
exports.deleteTour = (req, res) => {
    const id = req.params.id * 1;
    if(id >= tours.length){
        return res.status(404).json({
            status: "fail",
            message: 'Invalid ID'
        });
    }

    res.status(204).json({
        status: "success",
        data: null
    });
};


// Here all the handler functions are in the exports object.