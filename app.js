const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();


// ************************************************** Middlewares *********************************************

// Including a third-party middleware.
// Using morgan only when we are in development environment.
// console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Including a middle-ware to get the client data available in the request object.
app.use(express.json());

// Built-in Express Middleware to serve static files.
app.use(express.static(`${__dirname}/public`));

// Creating our own Middleware Function -> The order is very important here as if we create this after the route handlers then it will not be called as the request-responde cycle has already ended. So always try to define it globally on the top of the file.
// app.use((req, res, next) => {
//     console.log('Hello from the middleware...');
//     next();
// });

// Let's create a new middleware function to manipulate the request object.
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
});


// ********************************************** API Routes ************************************************** 
// Mounting the Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


// Handling Unhandled Routes
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `Can't find ${req.originalUrl} on this server!`
    // });

    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});


// Implementing a Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;