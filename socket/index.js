const { User } = require("../models");

const users = new Map();

const socketHandler = (socket) => {
  socket.on("join-user", async (userId) => {
    try {
      if (!userId) return;

      socket.join(userId);
      await User.findByIdAndUpdate(userId, {
        $set: { status: true },
      });
      socket.broadcast.emit("user-status", { userId, status: true });
      users.set(socket.id, userId);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("join-chat", (roomId) => {
    socket.join(roomId);
  });

  socket.on("leave-chat", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("user-status", (status) => {
    socket.broadcast.emit("user-status", status);
  });

  socket.on("send-offer", (data, chatId) => {
    socket.to(chatId).emit("receive-offer", data);
  });

  socket.on("send-answer", (answer, chatId) => {
    socket.to(chatId).emit("receive-answer", answer);
  });

  socket.on("start-typing", (chatId, user) => {
    if (!Array.isArray(user))
      return socket.to(user.id).emit("start-typing", user.name);

    user.forEach(({ id, name }) => {
      socket.to(id).emit("start-typing", name);
    });
  });

  socket.on("end-typing", (chatId, user) => {
    if (!Array.isArray(user))
      return socket.to(user.id).emit("start-typing", user.name);

    user.forEach(({ id, name }) => {
      socket.to(id).emit("start-typing", name);
    });
  });

  socket.on("disconnect", async () => {
    try {
      const userId = users.get(socket.id);

      if (!userId) return;

      await User.findByIdAndUpdate(userId, {
        $set: { status: false },
      });
      socket.broadcast.emit("user-status", { userId, status: false });
      users.delete(socket.id);
    } catch (error) {
      console.log(error);
    }
  });
};

const socket = {
  io: null,
  init(server) {
    this.io = require("socket.io")(server, {
      cors: { origin: "*" },
    });

    this.io.on("connection", socketHandler);
  },
};

module.exports = socket;
