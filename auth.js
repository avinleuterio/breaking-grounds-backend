// [SECTION] Dependencies and Modules
const jwt = require("jsonwebtoken");

// Used in the algorithm for encrypting our data which makes it difficult to decode
const secret = "ECommerceAPI";

// [SECTION] Token Creation
module.exports.createAccessToken = (user) => {

	// When the user logs in, a token will be created with user's information
	const data = {
		id: user._id,
		username: user.username,
		isAdmin: user.isAdmin
	}
	return jwt.sign(data, secret, {});
}

// [SECTION] Token Verification
module.exports.verify = (req, res, next) => {
    // Extract the token from the authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ auth: "Failed. No Token." });
    }

    jwt.verify(token, secret, function (err, decodeToken) {
        if (err) {
            return res.status(401).json({
                auth: "Failed",
                message: err.message
            });
        } else {
            // Attach user information to the request object
            req.user = decodeToken;
            next();
        }
    });
};

// [SECTION] verifyAdmin - Verify if the logged in user is an Admin
module.exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json({
            auth: "Failed",
            message: "Action Forbidden"
        });
    }
};