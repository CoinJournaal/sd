var express = require("express"),
    app = express();
var fs = require("fs");
var Canvas = require("canvas");

var port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/public'));

app.get("/sayHello", function (request, response) {
  var user_name = request.query.user_name;
  response.end("Hello " + user_name + "!");
});

app.get("/png", function (request, res) {
    res.setHeader('Content-Type', 'image/png');
    draw().pngStream().pipe(res);
});

function draw() {
    var Canvas = require('canvas'),
        Image = Canvas.Image,
        canvas = new Canvas(200, 200),
        ctx = canvas.getContext('2d');

    ctx.font = '30px Impact';
    ctx.rotate(0.1);
    ctx.fillText('Awesome!', 50, 100);
    
    var buf = canvas.toBuffer();
    fs.writeFileSync("public/test.png", buf);

    return canvas;
}


app.listen(port);
console.log("Listening on port ", port);
