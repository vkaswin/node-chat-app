const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @des register user
// @route POST /api/auth/register
const register = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    if (!userName || !email || !password) {
      res.status(400);
      throw new Error("Please add all fields");
    }

    let isUserExist = await User.findOne({ email });
    if (isUserExist) {
      res.status(400);
      throw new Error("User already exists");
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
      res.status(400);
      throw new Error("Please add all fields");
    }

    let user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).send({
        message: "Login success",
        token: generateJwtToken({ userId: user.id }),
      });
    } else {
      res.status(400).send({ message: "Email or password is wrong" });
    }
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
