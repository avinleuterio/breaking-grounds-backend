// Dependencies and Modules
const mongoose = require("mongoose");
  
// Schema/Blueprint for User
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required!"]
    },

    password: {
        type: String,
        required: [true, "Password is required!"]
    },

    firstName: {
        type: String,
        required: [true, "Firstname is required!"]
    },

    lastName: {
        type: String,
        required: [true, "Lastname is required!"]
    },

    email: {
        type: String,
        required: [true, "Email is required!"]
    },

    mobileNo: {
        type: String,
        required: [true, "Number is required!"]
    },

    address: {
        type: String,
        required: [true, "Address is required!"]
    },

    isAdmin: {
        type: Boolean,
        default: false
    },

    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]
});

// Model
module.exports = mongoose.model("User", userSchema);