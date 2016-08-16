var app = require("express")();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var mongo = require("mongodb").MongoClient;
var bodyParser = require("body-parser");
var methodOverride = require('method-override');
var logger = require('morgan');
var serveStatic = require('serve-static');
var errorhandler = require('errorhandler');
var formidable = require("formidable");
var fs = require("fs");
var grid = require("gridfs-stream");
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
            stream.on("data", function(thecollection) {
                socket.emit("login", thecollection.users);
                socket.emit("chat", thecollection.messages);
                socket.emit("upload", thecollection.videos);
                socket.emit("upload", thecollection.images);
            });
    });
    
    socket.on("disconnect", function() {
        console.log("user disconnected");
    });
    
    socket.on("login", function(username) {
        mongo.connect(MONGOLAB_URI, function(err, db) {
            if (err) {
                console.log("error");
            }
            var collection = db.collection("chatmessages");
                collection.insert({users: username}, function(err, doc) {
                    if (err) {
                        console.log("error insterting username to database")
                        return;
                    }
                    console.log(username + " logged in - users")
                });
        });
        socket.broadcast.emit("login", username)
    });

    socket.on("chat", function(msg) {
        var count = [];
        count.push(msg)
        username = count[0]
        message1 = {
            user: username,
            msg: msg
        };
        var message = JSON.stringify(message1);

        mongo.connect(MONGOLAB_URI, function(err, db) {
            if (err) {
                console.log("error");
            }
           var collection = db.collection("chatmessages");
           if(count.length - 1 > 0) {
                collection.insert({messages: message}, function(err, doc) {
                    if (err) {
                        console.log("error insterting msg to database")
                        return;
                    }
                    console.log("inserted " + message + " to db - content")
                });
           };
        });
            //if(count.length - 1 > 0)
                socket.broadcast.emit("chat", message);
    });

 socket.on("upload", function(evt) {
     var data = evt.target.result 
     var buffer = new Buffer(data, 'base64');
     var user = [];
     user.push(evt)
     username = user[0]
     var message1 = {
         user: username,
         msg: data
        };
     var message2 = {
         user: username,
         msg: data.split(',')[1]
        };
     var message = JSON.stringify(message1)
     var messageMongo = JSON.stringify(message2)
     mongo.connect(MONGOLAB_URI, function(err, db) {
            if (err) {
                console.log("error");
            }
            var collection = db.collection("chatmessages");

            if(buffer.toString().includes("image") && user.length - 1 > 0) {
                collection.insert({images: messageMongo}, function(err, doc) {
                    if (err) {
                        console.log("error insterting image data to database")
                        return;
                    }
                });
            } 
            if(buffer.toString().includes("video") && user.length - 1 > 0) {
                collection.insert({videos: messageMongo}, function(err, doc) {
                    if (err) {
                        console.log("error insterting video data to database")
                        return;
                    }
                }); 
            }
        });
        //if(user.length - 1 > 0)
            socket.broadcast.emit("upload", message);
    });
});


server.listen(app.get("port"), function () {
	console.log("listening on " + app.get("port"));
});
