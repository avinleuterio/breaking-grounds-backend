// [SECTION] Dependencies and Modules
const Product = require("../models/Product");
const User = require("../models/User");
const Order = require('../models/Order');
const bcrypt = require("bcrypt");
const auth = require("../auth");

// [SECTION] Adding new product
module.exports.addProduct = async (req, res) => {
    const adminId = req.user.id;

    try {
        // Check if the user is an admin
        const adminUser = await User.findById(adminId);
        if (!adminUser || !adminUser.isAdmin) {
            console.log('User is not an admin.');
            return res.status(403).json({ error: 'Only admins can add products.' });
        }

        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            quantityInStock: req.body.quantityInStock,
            imageUrl: req.body.imageUrl
        });

        // Handle validation errors using Mongoose's ValidationError
        const validationResult = newProduct.validateSync();
        if (validationResult && validationResult.errors) {
            const errors = {};
            for (let key in validationResult.errors) {
                errors[key] = validationResult.errors[key].message;
            }
            return res.status(400).json({ errors });
        }

        const product = await newProduct.save();

        console.log('Product successfully added!');
        return res.json({ message: 'Product successfully added!', product });
    } catch (error) {
        console.error("Error adding product:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// [SECTION] Retrieving all products
module.exports.getAllProducts = (req, res) => {
    return Product.find({}).then(result => {
        console.log('Retrieved all products successfully!');
        return res.send(result);
    }).catch(error => {
        console.error('Error retrieving all products:', error.message);
        return res.send(error);
    });
};

// [SECTION] Retrieving all ACTIVE products
module.exports.getAllActive = (req, res) => {
    return Product.find({ isActive: true }).then(result => {
        console.log('Retrieved all active products successfully!');
        return res.send(result);
    }).catch(error => {
        console.error('Error retrieving all active products:', error.message);
        return res.send(error);
    });
};

// [SECTION] Retrieving SPECIFIC products by name
module.exports.searchProductByName = async (req, res) => {
    try {
        const { productName } = req.body;

        // Use a regular expression to perform a case-insensitive search
        const products = await Product.find({
            name: { $regex: productName, $options: 'i' }
        });

        console.log('Products retrieved by name successfully!');
        res.json(products);
    } catch (error) {
        console.error('Error retrieving products by name:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// [SECTION] Retrieving SPECIFIC products
module.exports.getProduct = (req, res) => {
    return Product.findById(req.params.productId).then(result => {
        return res.send(result);
    })
    .catch(error => res.send(error));
}

// [SECTION] Retrieving products by category
module.exports.getProductsByCategory = (req, res) => {
    const { category } = req.params;
    return Product.find({ category: category }).then(result => {
        console.log(`Retrieved all ${category} products successfully!`);
        return res.send(result);
    }).catch(error => {
        console.error(`Error retrieving ${category} products:`, error.message);
        return res.send(error);
    });
};


// [SECTION] Updating a SPECIFIC product

module.exports.updateProduct = (req, res) => {

    // Specify the fields/properties of the document to be updated
    let updateProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        quantityInStock: req.body.quantityInStock,
        imageUrl: req.body.imageUrl
    };

    // Syntax
        // finyByIdAndUpdate(document ID, updatesToBeApplied)

    return Product.findByIdAndUpdate(req.params.productId, updateProduct).then((result, error) => {
        
        // Course not udpated
        if(error){
            return res.send(false);

        // Course updated successfully
        } else {
            return res.send(true);
        }
    })
}
// [SECTION] Archiving a product
module.exports.archiveProduct = async (req, res) => {
    try {
        const result = await Product.findByIdAndUpdate(req.params.productId, { isActive: false });

        if (!result) {
            console.log('Product not found or not archived');
            return res.status(404).send({ success: false, message: "Product not found or not archived" });
        }

        console.log('Product archived successfully!');
        res.send({ success: true, message: 'Product archived successfully!' });
    } catch (error) {
        console.error("Error archiving product:", error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
};

// [SECTION] Activating a product
module.exports.activateProduct = async (req, res) => {
    try {
        const result = await Product.findByIdAndUpdate(req.params.productId, { isActive: true });

        if (!result) {
            console.log('Product not found or not activated');
            return res.status(404).send({ success: false, message: "Product not found or not activated" });
        }

        console.log('Product activated successfully!');
        res.send({ success: true, message: 'Product activated successfully!' });
    } catch (error) {
        console.error("Error activating product:", error.message);
        res.status(500).send({ success: false, error: "Internal Server Error" });
    }
};

