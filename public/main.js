const socket = io();
let username = "";

let pageEntry = $(".page-entry");
let pageChat = $(".page-chat");

$(document).ready(function () {
  $("#enter-chat").click(function () {
    username = $("#username").val();

    if (username) {
      socket.emit("join,user", username);
      $("#username").val("");

      $(pageEntry).css("display", "none");
      $(pageChat).css("display", "flex");
      document.title = "Chat (" + username + ")";
    }

    socket.on("list, users", (data) => {
      $(".user-list").empty();
      $(".user-list").append(data.map((item) => userItem(item)));
      $(".chat-messages").append(userIn(username));
      $("#total-users").text(data.length);
    });

    socket.on("list update users", (data) => {
      $(".user-list").append(userItem(data));
      $(".chat-messages").append(userIn(data));
    });
  });

  $("#send-button").click(function () {
    let message = $("#message").val();
    let time = new Date();
    let timeMessage = time.toLocaleString("pt-BR", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const messageData = {
      message: message,
      time: timeMessage,
      sender: username,
    };

    socket.emit("sent, message", messageData);
    $("#message").val("");
  });

  socket.on("list message add", (data) => {
    console.log({ ...data, class: "sent" });
    $(".chat-messages").append(messageSend({ ...data, class: "sent" }));
  });

  socket.on("message update", (data) => {
    console.log("mensage", data);
    $(".chat-messages").append(messageSend({ ...data, class: "received" }));
  });

  $("#btn-logout").click(function(){
    console.log("teste")

    socket.emit("disconnect", username);
  })
});



function userItem(user) {
  let li = $("<li>", { class: "user-item", text: user });
  let status = $("<span>", { class: "user-status" });
  $(li).prepend(status);
  return li;
}

function userIn(user) {
  let p = $("<p>", { class: "user-in", text: user + " entrou na sala" });
  return $(p);
}

function messageSend(message) {
  let div = $("<div>", { class: "message" + " " + message.class });
  let sender = $("<p>", {
    class: "message-sender",
    text: message.sender === username ? "Voce" : message.sender,
  });
  let text = $("<p>", { class: "message-text", text: message.message });
  let time = $("<p>", { class: "message-time", text: message.time });

  return $(div).append(sender).append(text).append(time);
}
