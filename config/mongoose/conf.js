// app/models/user.js
// load the things we need
let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');

// define the schema for our user model
let userSchema = mongoose.Schema({

    name: String,
    lastname: String,
    email: String,
    password: String,

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);