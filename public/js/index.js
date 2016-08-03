var socket = io();

var users = [];
var users2 = [];
var message = ''

$('#message-box').on('keyup', function() {
    var status = ($('#message-box').val().trim() === '')
           $("#login-btn").prop("disabled", status)
});

$("#login-btn").click(function() {
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    var username = $('#message-box').val();
    socket.emit("login", username);
    socket.emit("chat", username)
    $('#messages').append($('<p>').text("you have logged in as '" + username + "' {" +time+ "}"));
    $('#message-box').val('');
    $('#message-box').attr("placeholder", "Dunjazz write a message here...").val('').focus().blur();
    $("#login-btn").remove();
    $('#message-box').on('keyup', function() {
        var status = ($('#message-box').val().trim() === '')
        $("#send-message-btn").prop("disabled", status)
    });
    $('#message-box').keyup(function(event){
        if(event.keyCode == 13 && $('#message-box').val().trim() !== ''){
            event.preventDefault();
            $('#send-message-btn').click();
        } return false
    });
});
socket.on("login", function (username) {
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    var day = dt.toDateString();
    users2.push(username)
        if(users2.length - 1 < 10 && username !== null) {
            $('#messages').prepend($('<p>').text(username))
        } else if (username !== null) {
            $('#messages').append($('<p>').text("'" + username + "'" + " logged in on" + " " + day + " at " + time))
        };
});

$('#send-message-btn').click(sendClick);
    
    function sendClick () {
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        var msg = $('#message-box').val() + " {" +time+ "}";
        socket.emit('chat', msg);
        $('#messages').append($('<p>').text(msg));
        $('#message-box').val('');
        $('#send-message-btn').prop('disabled', true)
        return false;
    };

socket.on('chat', function (message) {
    users.push(message)

    if(users.length - 1 < 10) {
        $('#messages').prepend($('<p>').text(message))
    } else {
        $('#messages').append($('<p>').text(message));
    };
});