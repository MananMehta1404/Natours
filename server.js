const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Reading the environment variables from the config.env file and adding it to the NODE JS Environment variables.
dotenv.config({path: './config.env'});

const app = require('./app');

// Replacing the <PASSWORD> string with the actual database password.
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// Connecting to the remote database using mongoose.
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log("DB connection successful!"));


// Creating our first document
// const testTour = new Tour({
//     name: 'The Camp Parker',
//     price: 997
// });

// Saving the tour instance to the database
// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('ERROR: ', err);
// });

// Connecting to a local database
// mongoose.connect(process.env.DATABASE_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true
// }).then(() => console.log("DB connection successful!"))

// Checking the environment variable set by the Express by default.
// console.log(app.get('env'));

// Different environment variables used by Node JS
// console.log(process.env);

// ******************************************* Starting the server ********************************************

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION! Shutting Down...');
    server.close(() => {
        process.exit(1);
    });
});
