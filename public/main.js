const socket = io();
let username = "";

let pageEntry = $(".page-entry");
let pageChat = $(".page-chat");

$(document).ready(function () {
   var id_user = ""

  $("#enter-chat").click(function () {
    username = $("#username").val();
    id_user =  Math.floor(Math.random() * 1000);

    if (username) {
      socket.emit("join user", {id: id_user, name: username});
      $("#username").val("");

      $(pageEntry).css("display", "none");
      $(pageChat).css("display", "flex");
      document.title = "Chat (" + username + ")";
    }

    socket.on("list users", (data) => {
      $(".user-list").empty();
      $(".user-list").append(data.map((item) => userItem(item)));
      $(".chat-messages").append(userIn(username, "connection"));
      $("#total-users").text(data.length);
    });

    socket.on("list update user", (data) => {
      $(".user-list").append(userItem(data));
      $(".chat-messages").append(userIn(username, "connection"));
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
    console.log("#"+id_user)
   
    socket.disconnect();

    
    
  })

  socket.on("list update users", (data, userName) => {
      $(".user-list").html(data.map(item => userItem(item)));

      // console.log(username)
      $(".chat-messages").append(userIn(userName, "desconnect"));
    });


});

function userItem(user) {
  let li = $("<li>", { id:user.id, class: "user-item", text: user.name });
  let status = $("<span>", { class: "user-status" });
  $(li).prepend(status);
  return li;
}

function userIn(user, status) {
  console.log(status)
  let statusMsg = status === "connection" ? " entrou no chat" : "saiu do chat";
  let p = $("<p>", { class: "user-in", text: user + statusMsg});
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
