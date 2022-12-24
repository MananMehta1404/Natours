const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// ************************************************** Middlewares *********************************************

// Including a third-party middleware.
app.use(morgan('dev'));

// Including a middle-ware to get the client data available in the request object.
app.use(express.json());

// Creating our own Middleware Function -> The order is very important here as if we create this after the route handlers then it will not be called as the request-responde cycle has already ended. So always try to define it globally on the top of the file.
app.use((req, res, next) => {
    console.log('Hello from the middleware...');
    next();
});

// Let's create a new middleware function to manipulate the request object.
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});


// ******************************************* Basic Information ********************************************

// Status Codes: 200 -> OK, 201 -> Created, 204 -> No Content, 404 -> Not Found

// http get() method
// app.get('/', (req, res) => {
    // res.status(200).send('Hello from the server side!');
    // res.status(404).json({ message: 'Hello from the server side!', app: 'Natours'});
// });

// http post() method
// app.post('/', (req, res) => {
    // by default status is 200 i.e OK
    // res.send('You can post to this endpoint...');
// });

// Reading the tours data synchronously.
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


// ******************************************** Handler Functions ********************************************* 

// Function handling the get() request of all the tours.
const getAllTours = (req, res) => {
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
}

// Function handling the get() request to get a specific tour from all the tours.
const getSpecificTour = (req, res) => {
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
}

// Function handling the post() request to create a new tour in the tours data.
const createTour = (req, res) => {
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
}

// Function handling the update() request to update a specific tour in the tours data.
const updateTour = (req, res) => {
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
}

// Function handling the delete() request to delete a specific tour from the tours data.
const deleteTour = (req, res) => {
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
}


// ********************************************** API Routes ************************************************** 

// Creating a get request for the tours data so that we can get the data of all the tours.
// app.get('/api/v1/tours', getAllTours);          (First Approach)

// Creating a get request for the tours data so that we can get the data of a specific tour.
// Reading the parmaters specified in the url.
// By specifying :id we are telling that this is a compulsory variable(parameter) and :y? means that this is a optional parameter. ('/api/v1/tours/:id/:x/:y?')
// app.get('/api/v1/tours/:id', getSpecificTour);  (First Approach)


// Creating a post request for the tours so that we can add a new data to the tours.
// app.post('/api/v1/tours', createTour);          (First Approach)

// Handling the patch request using patch() method to update the data of an existing tour.
// Not implemented here as in real cases we don't do this with files, we actually do this with the database.
// app.patch('/api/v1/tours/:id', updateTour);     (First Approach)

// Handling the delete request using delete() method to delete an existing tour.
// Not implemented here as in real cases we don't do this with files, we actually do this with the database.
// app.delete('/api/v1/tours/:id', deleteTour);    (First Approach)


// (Second and Simple Approach) -> Basically we will not repeat the same routes for different requests.
app.route('/api/v1/tours').get(getAllTours).post(createTour);
app.route('/api/v1/tours/:id').get(getSpecificTour).patch(updateTour).delete(deleteTour);


// ******************************************* Starting the server ********************************************

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});