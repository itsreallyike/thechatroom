var socket = io();
var users2 = [];

$("#upload-btn").css("visibility", "hidden")
$('#message-box').on('keyup', function() {
    var status = ($('#message-box').val().trim() === '')
           $("#login-btn").prop("disabled", status)
});

$("#login-btn").click(function() {
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    var day = dt.toDateString();
    var message3 = $('#message-box').val();
    var username1 = "'" + message3 + "'" + " logged in on" + " " + day + " at " + time
    socket.emit("login", username1);
    socket.emit("chat", message3);
    socket.emit("upload", message3);
    $('#messages').append($('<p>').text("you have logged in as '" + message3 + "' {" +time+ "}"));
    $('#message-box').val('');
    $('#message-box').attr("placeholder", "Write a message..").val('').focus().blur();
    $("#login-btn").remove();
    $("#upload-btn").css("visibility", "visible");
    $("#upload-btn").prop("disabled", false);
    $('#message-box').on('keyup', function() {
        var status = ($('#message-box').val().trim() === '')
        $("#send-message-btn").prop("disabled", status);
    });
    $('#message-box').keyup(function(event){
        if(event.keyCode == 13 && $('#message-box').val().trim() !== ''){
            event.preventDefault();
            $('#send-message-btn').click();
        } return false
    });
});
socket.on("mongo", function(collection) {
    messages = JSON.parse(collection)

    if(messages.user1 && messages.user1 !== null) {
        $('#messages').prepend($('<p>').text(messages.user1))
        }
    if(messages.user2) {
        $('#messages').prepend($('<p>').text(messages.user2 + ": " + messages.msg2)) 
        } 
    if(messages.user3) {
        if(messages.msg3.includes("data:image/")) {
            $('#messages').prepend($('<p>').text(messages.user3 + ": "), '<img src="' + messages.msg3 + '"/>', $('<p>'));
            } 
        if(messages.msg3.includes("data:video/")) {
            $('#messages').prepend($('<p>').text(messages.user3 + ": "), '<video src="' + messages.msg3 + '"controls/>');
            } 
    }
});
socket.on("login", function (username) {
    login = JSON.parse(username)
       if (login.user1 !== null) {
            $('#messages').append($('<p>').text(login.user1))
        };
});

$("#upload-btn").click(function() {
    $("#uploadFile").click();
    var upload = $("#uploadFile")
    upload.on("change", function(e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function(evt) {
            socket.emit("upload", evt.target.result);
            if(evt.target.result.includes("image")) {
                $('#messages').append($('<p>'), '<img src="' + evt.target.result + '"/>')
            }
            if(evt.target.result.includes("video")) {
                $('#messages').append($('<p>'), '<video src="' + evt.target.result + '"controls/>')
            };
        }
    });
});

socket.on("upload", function(message) {
    message2 = JSON.parse(message)
    if(message2.msg3.includes("data:image/")) {
            $('#messages').append($('<p>').text(message2.user3 + ": "), '<img src="' + message2.msg3 + '"/>', $('<p>'));
    }
    if(message2.msg3.includes("data:video/")) {
            $('#messages').append($('<p>').text(message2.user3 + ": "), '<video src="' + message2.msg3 + '"controls/>');
    }
});

$('#send-message-btn').click(function() {
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        var msg = $('#message-box').val() + " {" +time+ "}";
        socket.emit('chat', msg);
        $('#messages').append($('<p>').text(msg));
        $('#message-box').val('');
        $('#send-message-btn').prop('disabled', true)
        return false;
    });

socket.on('chat', function (message) {
    message1 = JSON.parse(message)
        $('#messages').append($('<p>').text(message1.user2 + ": " + message1.msg2))
});