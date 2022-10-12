const { Reaction, Message } = require("../models");

const createReaction = async (req, res) => {
  let {
    body: { reaction, msgId },
    user: { id },
  } = req;
  console.log(reaction);
  try {
    let msg = await Message.findById(msgId);
    if (!msg) return res.status(400).send({ message: "MessageId Not Found" });

    let { _id } = await Reaction.create({
      reaction,
      msgId,
      user: id,
    });
    await Message.findByIdAndUpdate(msgId, { $push: { reactions: _id } });
    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

const updateReaction = async (req, res) => {
  let {
    body: { reaction, id },
  } = req;
  try {
    let isExist = await Reaction.findById(id);
    if (!isExist)
      return res.status(400).send({ message: "ReactionId Not Found" });

    await Reaction.findByIdAndUpdate(id, {
      $set: {
        reaction,
      },
    });

    return res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  updateReaction,
  createReaction,
};
