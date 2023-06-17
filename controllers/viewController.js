const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

// For the getOverview and getTour functions, we need to get the data from the database and then render the template.
exports.getOverview = catchAsync(async (req, res, next) => {
    // 1) Get tour data from collection
    const tours = await Tour.find();

    // 2) Build template
    // 3) Render that template using tour data
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    // 2) Build template
    // 3) Render template using data from 1)
    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

// For the getLoginForm function, we just need to render the template.
exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
}