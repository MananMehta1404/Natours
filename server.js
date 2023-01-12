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

// Creating a Schema for our tours.
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true
    },
    rating: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    }
});

// Creating a model for tourSchema.
const Tour = mongoose.model('Tour', tourSchema);

// Creating our first document
const testTour = new Tour({
    name: 'The Camp Parker',
    price: 997
});

testTour.save().then(doc => {
    console.log(doc);
}).catch(err => {
    console.log('ERROR: ', err);
});

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
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
