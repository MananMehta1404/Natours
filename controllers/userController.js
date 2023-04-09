const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

// ******************************************** Handler Functions ********************************************* 

// Functions handling the users routes
exports.getAllUsers = catchAsync(async (req, res) => {
    // Executing the query
    const users = await User.find();

    // Send Response
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    });
});

exports.getOneUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!'
    });
};