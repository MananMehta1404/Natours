const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require("./handlerFactory");

// ******************************************** Handler Functions ********************************************* 

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

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

// Function to update the data of the current user.
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user POSTs password data.
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword.', 400));
    }

    // 2) Filter out unwanted fields names that are not allowed to be updated.
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update user document.
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    // 4) Send response.
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Function to delete the current user.
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    // 204 means no content.
    res.status(204).json({
        status: 'success',
        data: null
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

// Function to delete a user only by an administrator.
exports.deleteUser = factory.deleteOne(User);