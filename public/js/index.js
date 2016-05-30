var socket = io();

$("#send-message-btn").on('click', function(event) {
    event.preventDefault();
});

$("#login-btn").click(function() {
    var username = $('#message-box').val(); //Type username and click login 
    socket.emit("login", username);
    $('#messages').append($('<p>').text("'" + username + "'" + " - has logged in."));
    $('#message-box').val('');
    $('#message-box').attr("placeholder", "Dunjazz write a message here...").val("").focus().blur();
    $("#login-btn").remove()
    $("#send-message-btn").prop("disabled", false)
    return false
});
socket.on("login", function (username) {
    $('#messages').append($('<p>').text("'" + username + "'" + " - has logged in."));
});

$('#send-message-btn').click(function () {
    var msg = $('#message-box').val(); //Dunjazz write a message here...
    socket.emit('chat', msg);
    $('#messages').append($('<p>').text(msg));
    $('#message-box').val('');
    return false;
});

socket.on('chat', function (msg) {
    $('#messages').append($('<p>').text(msg));
});