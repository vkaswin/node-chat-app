const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @des register user
// @route POST /api/auth/register
const register = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    if (!userName || !email || !password) {
      res.status(400).send({ message: "Please add all fields" });
      return;
    }

    let res = await User.findOne({ email });

    if (!res) {
      res.status(400).send({ message: "User already exists" });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      userName,
      email,
      password: hashPassword,
    });

    res.status(200).send({
      message: "User registerd successfully",
      data: { userName: user.userName, email: user.email, userId: user._id },
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Error" });
  }
};

// @des login user
// @route POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).send({ message: "Please add all fields" });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      res.status(400).send({ message: "User not exist" });
      return;
    }

    let checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(400).send({ message: "Wrong Password" });
      return;
    }

    res.status(200).send({
      message: "Login success",
      token: generateJwtToken({ userId: user.id }),
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Error" });
  }
};

const generateJwtToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = {
  register,
  login,
};
