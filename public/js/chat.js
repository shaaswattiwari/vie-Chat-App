const socket = io();

const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const messages = document.querySelector("#messages");
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const showicon = document.querySelector(".iconshow");
const hideicon = document.querySelector(".iconhide");
const sidebar = document.querySelector(".chat__sidebar");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const newMessage = messages.lastElementChild;
  const newMessageStyle = getComputedStyle(newMessage);
  const newMessageHeight =
    newMessage.offsetHeight + parseInt(newMessageStyle.marginBottom);

  const visibleHeight = messages.offsetHeight;
  const containerHeight = messages.scrollHeight;
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", (msg) => {
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
    class: msg.username === username ? "user" : "other",
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (msg) => {
  // console.log(msg);
  const html = Mustache.render(locationTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
    class: msg.username === username ? "user" : "other",
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, { room, users });
  document.querySelector(".chat__sidebar").innerHTML = html;
});

const input = document.querySelector("#input");
document.querySelector("#btn").addEventListener("click", () => {
  if (input.value !== "") {
    socket.emit("clientMsg", input.value, (msg) => {
      // console.log(msg);
    });
    input.value = "";
  }
});

document.querySelector("#btnLocation").addEventListener("click", () => {
  document.querySelector("#btnLocation").disabled = true;
  if (!navigator.geolocation) {
    return alert("NO SUPPORT");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        // console.log("Location shared");
        document.querySelector("#btnLocation").disabled = false;
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});

showicon.addEventListener("click", () => {
  showicon.classList.add("hide");
  hideicon.classList.remove("hide");
  sidebar.classList.add("show");
});

hideicon.addEventListener("click", () => {
  showicon.classList.remove("hide");
  hideicon.classList.add("hide");
  sidebar.classList.remove("show");
});
