const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @des register user
// @route POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).send({ message: "Please add all fields" });
    }

    let existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
    });

    res.status(200).send({
      message: "User registerd successfully",
      data: {
        name: user.name,
        email: user.email,
        userId: user._id,
      },
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
      return res.status(400).send({ message: "Please add all fields" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ message: "User not exist" });
    }

    let checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(400).send({ message: "Wrong Password" });
    }

    res.status(200).send({
      message: "Login success",
      token: generateJwtToken({ id: user.id }),
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

const getUserById = async (req, res) => {
  try {
    const {
      params: { userId },
    } = req;

    let data = await User.findById(userId).select({
      name: 1,
      _id: 1,
      email: 1,
    });

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  register,
  login,
  getUserById,
};
