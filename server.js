const dotenv = require('dotenv');
// Reading the environment variables from the config.env file and adding it to the NODE JS Environment variables.
dotenv.config({path: './config.env'});

const app = require('./app');


// Checking the environment variable set by the Express by default.
// console.log(app.get('env'));

// Different environment variables used by Node JS
// console.log(process.env);

// ******************************************* Starting the server ********************************************

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
