require("dotenv").config();

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function createJwt(username) {
  const token = jwt.sign({ username }, JWT_SECRET);
  return token;
}

function verifyToken(token) {
  const data = jwt.verify(token, JWT_SECRET);
  return data;
}

module.exports = {
  createJwt,
  verifyToken,
};
