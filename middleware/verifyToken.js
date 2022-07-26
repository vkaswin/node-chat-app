const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers?.authorization;

    if (!token) return res.status(401).send({ message: "Unauthorized" });

    let decoded = jwt.verify(JSON.parse(token), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = verifyToken;
