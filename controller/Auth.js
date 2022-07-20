// @des login user
// @route POST /api/auth/login
const login = (req, res) => {
  res.status(200).send({ message: "Hello world!" });
};

module.exports = {
  login,
};
