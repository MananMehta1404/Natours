const fs = require('fs');
const express = require('express');

const app = express();

// Including a middle-ware to get the client data available in the request object.
app.use(express.json());

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

// Creating a get request for the tours data so that we can get the data of all the tours.
app.get('/api/v1/tours', (req, res) => {
    // We send the data in the Jsend data format of the JSON.
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }
    });
});


// Reading the parmaters specified in the url.
// By specifying :id we are telling that this is a compulsory variable(parameter) and :y? means that this is a optional parameter. ('/api/v1/tours/:id/:x/:y?')
app.get('/api/v1/tours/:id', (req, res) => {
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
        })
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});


// Creating a post request for the tours so that we can add a new data to the tours.
app.post('/api/v1/tours', (req, res) => {
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
});

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});