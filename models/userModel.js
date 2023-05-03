const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Creating a Schema for our users.
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE() and SAVE().
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        // This is for deactivating the user account.
        type: Boolean,
        default: true,
        select: false
    }
});

// Encrypting the password before saving it to the database.
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified.
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12.
    this.password = await bcrypt.hash(this.password, 12);

    // Delete the passwordConfirm field.
    this.passwordConfirm = undefined;

    next();
});

// Setting the passwordChangedAt property to the current time when the user changes the password.
userSchema.pre('save', function(next) {
    // If the password was not modified or the document is new, then return.
    if (!this.isModified('password') || this.isNew) return next();

    // Subtracting 1 second from the passwordChangedAt property to make sure that the token is always created after the password is changed.
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Query middleware to filter out the inactive users.
userSchema.pre(/^find/, function(next) {
    // this points to the current query.
    this.find({ active: { $ne: false } });
    next();
});

// Function to check if the password entered by the user is correct or not.
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Function to check if the user changed the password after the token was issued. 
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        // console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed.
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    // Creating a random token.
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Encrypting the token and storing it in the database.
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Setting the token expiry time to 10 minutes.
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    console.log({ resetToken }, this.passwordResetToken);

    return resetToken;
}

// Creating a model for userSchema.
const User = mongoose.model('User', userSchema);

module.exports = User;