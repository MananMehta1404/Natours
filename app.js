const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

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


// ********************************************** API Routes ************************************************** 
// Mounting the Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;