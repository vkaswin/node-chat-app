const { User } = require("../models");

const users = new Map();

const socketHandler = (socket) => {
  console.log("connected", socket.id);
  socket.on("join-user", (userId) => {
    // console.log(userId);
    // try {
    //   console.log(userId, "connect");
    //   if (!userId) return;
    //   socket.join(userId);
    //   await User.findByIdAndUpdate(userId, {
    //     $set: { status: true },
    //   });
    //   socket.broadcast.emit("user-status", { userId, status: true });
    //   users.set(socket.id, userId);
    // } catch (error) {
    //   console.log(error);
    // }
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

  socket.on("disconnect", () => {
    // console.log(socket.id);
    // try {
    //   const userId = users.get(socket.id);
    //   console.log(userId, "disconnect");
    //   if (!userId) return;
    //   await User.findByIdAndUpdate(userId, {
    //     $set: { status: false },
    //   });
    //   socket.broadcast.emit("user-status", { userId, status: false });
    //   users.delete(socket.id);
    // } catch (error) {
    //   console.log(error);
    // }
    // users.delete(socket.id);
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
