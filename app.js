const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitze = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();


// ********************************************** Global Middlewares *********************************************

// Setting security HTTP headers.
app.use(helmet());

// Including a third-party middleware.
// Using morgan only when we are in development environment.
// console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// Limiting the number of requests from the same IP.
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Including a middle-ware to get the client data available in the request object.
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection.
app.use(mongoSanitze());

// Data Sanitization against XSS.
app.use(xss());

// Preventing parameter pollution.
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

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
app.use('/api/v1/reviews', reviewRouter);


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