const chatSocket = (socket) => {
  socket.on("join-chat-room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("send-message", (message, chatId) => {
    socket.to(chatId).emit("receive-message", message);
  });

  socket.on("send-offer", (data, chatId) => {
    socket.to(chatId).emit("receive-offer", data);
  });

  socket.on("send-answer", (answer, chatId) => {
    socket.to(chatId).emit("receive-answer", answer);
  });
};

module.exports = chatSocket;
