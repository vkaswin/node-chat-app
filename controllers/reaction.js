const getAllReactions = async (req, res) => {
  try {
    const reactions = ["like", "love", "haha", "wow", "sad", "angry", "care"];
    res.status(200).send({ message: "Success", data: reactions });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

const createReaction = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

const updateReaction = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  getAllReactions,
  updateReaction,
  createReaction,
};
