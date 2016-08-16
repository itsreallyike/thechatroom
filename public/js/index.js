var socket = io();

var users2 = [];
var message = ''

$("#upload-btn").css("visibility", "hidden")
$('#message-box').on('keyup', function() {
    var status = ($('#message-box').val().trim() === '')
           $("#login-btn").prop("disabled", status)
});

$("#login-btn").click(function() {
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    var day = dt.toDateString();
    var message1 = $('#message-box').val();
    var username = "'" + message1 + "'" + " logged in on" + " " + day + " at " + time
    socket.emit("login", username);
    socket.emit("chat", message1);
    socket.emit("upload", message1)
    $('#messages').append($('<p>').text("you have logged in as '" + message1 + "' {" +time+ "}"));
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
socket.on("login", function (username) {
    users2.push(username)
        if(users2.length - 1 < 10 && username !== null) {
            $('#messages').prepend($('<p>').text(username))
        } else if (username !== null) {
            $('#messages').append($('<p>').text(username))
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
            $('#messages').append($('<p>').text(message), '<img src="' + evt.target.result + '"/>')
        };
    });
});

socket.on("upload", function(message) {
    var count = [];
    count.push(message)
    var message1 = JSON.parse(message)
    if(count.length - 1 < 10) {
        $('#messages').prepend($('<p>').text(message1.user + ": " + message1.msg))
    } else {
        $('#messages').append($('<p>').text(message1.user + ": " + message1.msg));
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
    var count = [];
    count.push(message)
    var message1 = JSON.parse(message)
    if(count.length - 1 < 10) {
        $('#messages').prepend($('<p>').text(message1.user + ": " + message1.msg))
    } else {
        $('#messages').append($('<p>').text(message1.user + ": " + message1.msg));
    }
});