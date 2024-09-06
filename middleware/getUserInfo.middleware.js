const jwt = require("jsonwebtoken");
// Instantiate the JWT token validation middleware
const getUserInfo = (req, _, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.TOKEN_SECRET);
    req.userId = payload._id;
  } catch (error) {
    req.userId = false;
  } finally {
    next();
  }
};

module.exports = getUserInfo;
