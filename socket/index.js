const socketHandler = (socket) => {
  socket.on("join-user", (roomId) => {
    socket.join(roomId);
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
