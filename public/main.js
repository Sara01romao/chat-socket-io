const socket = io();
let username = "";

let pageEntry = $(".page-entry");
let pageChat = $(".page-chat");

$(document).ready(function () {
  var id_user = "";

  $("#enter-chat").click(function () {
    username = $("#username").val();
    id_user = Math.floor(Math.random() * 1000);

    if(username === ""){
      $(".error-msg").css("display", "block");
      return;
    }

    if (username) {
      $(".error-msg").css("display", "none");
      socket.emit("join user", { id: id_user, name: username });
      $("#username").val("");

      $(pageEntry).css("display", "none");
      $(pageChat).css("display", "block");
      document.title = "ChatON (" + username + ")";
    }

    socket.on("list users", (data, user) => {
      $(".user-list").empty();
      $(".user-list").append(data.map((item) => userItem(item)));
      $(".chat-messages").append(userIn(user.name, "connection"));
      $("#total-users").text(data.length);
    });

    socket.on("list update user", (data, userTotal) => {
      $(".user-list").append(userItem(data));
      $(".chat-messages").append(userIn(data.name, "connection"));
      $("#total-users").text(userTotal);
    });
  });

   function mensageSend(){
    let message = $("#message").val();

    if (message !== "") {
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
    }
  }
  
  $('#message').on('keydown', function (e) {
    if (e.keyCode === 13) {
      mensageSend()
    }
  })

  $("#send-button").click(function () {
    mensageSend()
  });

  socket.on("list message add", (data) => {
    $(".chat-messages").append(messageSend({ ...data, class: "sent" }));
  });

  socket.on("message update", (data) => {
    $(".chat-messages").append(messageSend({ ...data, class: "received" }));
  });

  $("#btn-logout").click(function () {
    socket.disconnect();
    window.location = "/index.html";
  });

  socket.on("list update users", (data, userName) => {
    $(".user-list").html(data.map((item) => userItem(item)));
    $(".chat-messages").append(userIn(userName, "desconnect"));
    $("#total-users").text(data.length);
  });
});

function userItem(user) {
  let li = $("<li>", { id: user.id, class: "user-item", text: user.name });
  let status = $("<span>", { class: "user-status" });
  $(li).prepend(status);
  return li;
}

function userIn(user, status) {
  let statusMsg =
    status === "connection" ? " entrou no chat " : " saiu do chat ";
  let p = $("<p>", { class: "user-in", text: user + statusMsg });
  return $(p);
}

function messageSend(message) {
  let div = $("<div>", { class: "message" + " " + message.class });
  let sender = $("<p>", {
    class: "message-sender",
    text: message.sender === username ? "Você" : message.sender,
  });
  let text = $("<p>", { class: "message-text", text: message.message });
  let time = $("<p>", { class: "message-time", text: message.time });

  return $(div).append(sender).append(text).append(time);
}
