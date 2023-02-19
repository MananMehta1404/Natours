const mongoose = require('mongoose');
const slugify = require('slugify');

// Creating a Schema for our tours.
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true }, // toJSON: { virtuals: true } means that we want to show the virtual properties in the output.
    toObject: { virtuals: true } // toObject: { virtuals: true } means that we want to show the virtual properties in the output.
}); 

// Creating a virtual property for tourSchema.
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});


// Document Middleware: runs before .save() and .create() but not on .insertMany().

//pre() middleware runs before the actual event.
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true }); // this refers to the current document. 
    next();
});

// We can also have multiple pre() middleware functions.
// tourSchema.pre('save', function (next) {
//     console.log('Will save document...');
//     next();
// });

// post() middleware runs after the pre() middleware.
// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });


// Query Middleware: runs before all the query starts.

// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) { // /^find/ means that it will run before all the query that starts with find.
    this.find({ secretTour: { $ne: true } }); // this refers to the current query.
    this.start = Date.now();  // this.start is a custom property.
    next();
});

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    console.log(docs);
    next();
});


// Aggregation Middleware: runs before all the aggregation starts.

tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); // We are adding a new stage to the beginning of the aggregation pipeline.
    console.log(this.pipeline()); // this.pipeline() is a method that shows the aggregation pipeline.
    next();
});


// Creating a model for tourSchema.
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;