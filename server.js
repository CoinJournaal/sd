var express = require("express"),
    app = express();
var fs = require("fs");
var Canvas = require("canvas");

var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));

app.use("/public", express.static(path.join(__dirname, 'public')));

app.get("/sayHello", function (request, response) {
  var user_name = request.query.user_name;
  response.end("Hello " + user_name + "!");
});

app.get("/png", function (request, response) {
    
    var canvas = new Canvas(200, 200, "png");
    var g = canvas.getContext("2d");
    g.fillStyle = "black";
    g.fillRect(0, 0, 100, 100);

    var buf = canvas.toBuffer();
    fs.writeFileSync("/public/test.png", buf);
}

app.listen(port);
console.log("Listening on port ", port);
