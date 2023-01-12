const mongoose = require('mongoose');

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

module.exports = Tour;