var express = require("express"),
    app = express();
var fs = require("fs");
var Canvas = require("canvas");
var GIFEncoder = require('gifencoder');

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
    var encoder = new GIFEncoder(320, 240);
    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(500);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.
    
    var Canvas = require('canvas'),
        Image = Canvas.Image,
        canvas = new Canvas(200, 200),
        ctx = canvas.getContext('2d');

    ctx.font = '30px Impact';
    ctx.rotate(0.1);
    ctx.fillText('Awesome!', 50, 100);
    
    // first frame
    encoder.addFrame(ctx);
    
    // green rectangle
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 0, 200, 200);
    encoder.addFrame(ctx);
    
    encoder.finish();
    
    var buf = encoder.out.getData();
    fs.writeFile('public/test.gif', buf, function (err) {
      // animated GIF written to myanimated.gif
        console.log("write error: " + err);
    });

    return canvas;
}


app.listen(port);
console.log("Listening on port ", port);
