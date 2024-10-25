const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    // If token is attached, verify if it is valid
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Handle token errors (invalid or expired)
        return res.status(410).json({
          success: false,
          message:
            err.name === "TokenExpiredError"
              ? "Token has expired"
              : "Invalid token",
        });
      }

      // If the token is valid, attach user information to the request 
      req.user = {
        id: decoded.userId,
        role: decoded.role,
      };
      // Call route handler after successful 
      next();
    });
  } else {
    // If no token is provided, just call next to proceed without user info
    next();
  }
};

module.exports = authMiddleware;
