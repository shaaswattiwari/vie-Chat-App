const socket = io();
socket.on("countUpdated", (count) => {
  console.log("Received the event ", count);
});

document.querySelector("#increment").addEventListener("click", () => {
  socket.emit("increment");
});
