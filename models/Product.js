const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required!"]
    },
    description: {
        type: String,
        required: [true, "Description is required!"]
    },
    price: {
        type: Number,
        required: [true, "Price is required!"]
    },
    category: {
        type: String,
        required: true
    },
    quantityInStock: {
        type: Number,
        default: 0
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    imageUrl: {
        type: String,
        required: [true, "Image URL is required!"]
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("Product", productSchema);
