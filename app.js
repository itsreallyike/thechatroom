var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var mongo = require("mongodb").MongoClient;
var bodyParser = require("body-parser");
var methodOverride = require('method-override');
var logger = require('morgan');
var serveStatic = require('serve-static');
var errorhandler = require('errorhandler');
var jade = require('jade')
var path = require('path');
var MONGOLAB_URI = "mongodb://heroku_9b0h1n2s:a25o5qr7f0al9tp4jcmqfr0cic@ds017553.mlab.com:17553/heroku_9b0h1n2s"

app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(serveStatic(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
}

app.get("/", function(req, res) {
    res.render("index")
});

io.on("connection", function(socket) {
	console.log("a user connected..");
    
    mongo.connect(MONGOLAB_URI, function(err, db) {
        if(err) {
        console.log("error connecting to mongo db")
        }
        var collection = db.collection("chatmessages");
            var stream = collection.find().sort({_id : -1}).limit(10).stream();
            stream.on("data", function(chat) {
                socket.emit("chat", chat.content);
            });
        });
    
    socket.on("disconnect", function() {
        console.log("user disconnected");
    });

    socket.on("chat", function(msg) {
        mongo.connect(MONGOLAB_URI, function(err, db) {
            if (err) {
                console.log("error");
            }
            var collection = db.collection("chatmessages");
                collection.insert({content: msg}, function(err, doc) {
                    if (err) {
                        console.log("error insterting msg to database")
                        return;
                    }
                    console.log("inserted " + msg + " to db - content")
                });
            });
        socket.broadcast.emit("chat", msg);
    });
});

server.listen(app.get("port"), function () {
	console.log("listening on " + app.get("port"));
});
