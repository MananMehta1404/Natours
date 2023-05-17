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

// Functions handling the users routes.

// Function to get the current user.
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

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

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead.'
    });
};

// Function to get all users only by an administrator.
exports.getAllUsers = factory.getAll(User);

// Function to get a user only by an administrator.
exports.getUser = factory.getOne(User);

// Function to update a user only by an administrator.
// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);

// Function to delete a user only by an administrator.
exports.deleteUser = factory.deleteOne(User);