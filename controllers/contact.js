const { Contact, Chat } = require("../models");

// @des get all contacts
// @route POST /api/contact
const getContact = async (req, res) => {
  try {
    const {
      user: { id },
    } = req;

    let data = await Contact.find(
      { addedBy: id },
      { user: 1, chatId: 1 }
    ).populate("user", { _id: 1, name: 1, email: 1, avatar: 1, status: 1 });

    res.status(200).send({ message: "Success", data });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

// @des add contact
// @route POST /api/contact
const createContact = async (req, res) => {
  try {
    const {
      body: { userId },
      user: { id },
    } = req;

    const chat = await Chat.findOne({ users: { $all: [userId, id] } });

    if (!chat) {
      const { _id } = await Chat.create({ users: [userId, id] });
      req.chatId = _id;
    }

    const isExist = await Contact.findOne({ addedBy: id, user: userId });

    if (isExist)
      return res
        .status(200)
        .send({ message: "Contact has been added already " });

    const data = await Contact.create({
      addedBy: id,
      user: userId,
      chatId: chat ? chat._id : req.chatId,
    });

    res.status(200).send({ message: "Success", data: data.toObject() });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

// @des remove contact
// @route DELETE /api/contact/:contactId
const deleteContact = async (req, res) => {
  try {
    const {
      params: { contactId },
    } = req;

    await Contact.findByIdAndDelete(contactId);

    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error" });
  }
};

module.exports = {
  getContact,
  createContact,
  deleteContact,
};
