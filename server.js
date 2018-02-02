var express = require("express"),
    app = express();
var fs = require("fs");
var Canvas = require("canvas");
var GIFEncoder = require('gifencoder');

var port = process.env.PORT || 5000;

global.res1;

app.use(express.static(__dirname + '/public'));

app.get("/sayHello", function (request, response) {
  var user_name = request.query.user_name;
  response.end("Hello " + user_name + "!");
});

app.get("/png", function (request, res) {
 
	var cmc = new coinmarketcap();

	cmc.getall(processCMC);
	
	res1 = res;

});


function draw(img,outputData) {
    var encoder = new GIFEncoder(480, 270);
    
    encoder.start();
    encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
    encoder.setDelay(500);  // frame delay in ms
    encoder.setQuality(10); // image quality. 10 is default.

    var canvas = new Canvas(480, 270);
    var ctx = canvas.getContext('2d');

    // first frame   
    
    ctx.drawImage(img, 0, 0, 480, 270);
    ctx.fillStyle = '#00ff00';
    ctx.font = '30px Arial';
    ctx.fillText('#1 Stijger', 40, 70);
	ctx.fillStyle = '#ffffff';
	ctx.font = '50px Arial';
	ctx.fillText(outputData[0][0], 40, 110);
	ctx.font = '30px Arial';
	ctx.fillText(outputData[0][1], 40, 150);
	ctx.fillText(outputData[0][3] + " USD", 200, 300);
	ctx.fillStyle = '#00ff00';
	ctx.fillText(outputData[0][2] + " %", 200, 250);
	
    encoder.addFrame(ctx);

    // green rectangle
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 0, 200, 200);
    encoder.addFrame(ctx);

    encoder.finish();

    var buf = encoder.out.getData();
    fs.writeFile('public/test.gif', buf, function (err) {
      // animated GIF written
        console.log("GIF written");
        
    });

    return canvas;    
}

// Coinmarketcap data

const request = require('request');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(':memory:', function (err) {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

db.serialize(function() {
	
	//db.run("if exists DROP TABLE cmc");
	db.run("CREATE TABLE cmc (name text, percent_change_24h float, koers float, symbol text)");

});

function coinmarketcap() {

	// basic api
	//constructor() {
		this.convert = 'EUR'; // check 'https://coinmarketcap.com/api/' for all possible currencies
		this.apiurl = `http://api.coinmarketcap.com/v1/ticker/?convert=${this.convert}`;
		this.apiurl_global = `http://api.coinmarketcap.com/v1/global/?convert=${this.convert}`;
	//}

	coinmarketcap.prototype._getjsonglobal = function ( url, callback ) {
		request( this.apiurl_global+url, function( error, response, body ) {
			if( error ) { 
				callback( false );
				return this;
			}
			if( response && response.statusCode == 200 ) {
				callback( JSON.parse(body) );
			} else {
				callback( false );
				return this;
			}
		});
	}

	// retrieve our json api
	coinmarketcap.prototype._getjson = function( url, callback ) {
		request( this.apiurl+url, function( error, response, body ) {
			if( error ) { 
				callback( false );
				return this;
			}
			if( response && response.statusCode == 200 ) {
				callback( JSON.parse( body) );
			} else {
				callback( false );
				return this;
			}
		});
	}

	// find coin id through coin symbol or id (e.g. 'btc' => 'bitcoin')
	coinmarketcap.prototype._find = function( symbol, json ) {
		return json.filter(
			function( json ) {
				return json.symbol == symbol.toUpperCase() || json.id == symbol.toLowerCase();
			}
		)
	}

	// get full coin list from coinmarketcap
	coinmarketcap.prototype._coinlist = function( callback ) {
		if( callback ) {
			this._getjson( '&limit=0', callback );
			return this;
		} else {
			return false;
		}
	}

	coinmarketcap.prototype._global = function( callback ) {
		if( callback ) {
			this._getjsonglobal( '', callback );
			return this;
		} else {
			return false;
		}
	}

	// get single coin's data
	coinmarketcap.prototype.get = function( symbol, callback ) {
		this._coinlist( coins => {
			var found = this._find( symbol, coins );
			callback( found[0] );
		})
	}

	// example usage:
	// cmc.get('btc', data => {
	// 		console.log(data['price_usd']);
	// });

	coinmarketcap.prototype.getall = function( callback ) {
		this._coinlist(coins => {
			callback( coins );
		}); 
	}

	// example usage:
	// cmc.getall(data => {
	// 		console.log(data[0]['price_usd']);
	// });

	coinmarketcap.prototype.getglobal = function ( callback ) {
		this._global(data => {
			callback( data );
		}); 
	}

}

var processCMC = function(data) {
	console.log(data.length);
	for(var i = 0; i < data.length; i++) {
		if(typeof data[i]['percent_change_24h'] === "undefined") {
			data.splice(i,1);
		}
		else if(!data[i]['percent_change_24h']) {
			data.splice(i,1);
		}
		else if(data[i]['name']){
			db.run("INSERT INTO cmc VALUES ('" + encodeURIComponent(escape(data[i]['name'])) + "', '" + parseFloat(data[i]['percent_change_24h']) + "', '" + parseFloat(data[i]['price_usd']) + "', '" + encodeURI(data[i]['symbol']) + "')", 
			[], 
			function (err) {
				if (err) {
					console.log(err);
				}
			});
		}
	}
	
	var sql = "SELECT * FROM cmc ORDER BY percent_change_24h DESC";
	db.all(sql, [], function(err, rows) {
		if (err) {
			console.log(err);	
		}
		var arraylist = new Array();
		rows.forEach((row) => {
			arraylist.push([row.name,row.symbol,row.percent_change_24h,row.koers]);
		});

		// Total entries
		console.log(arraylist.length);
		
		// Top 1 Gainer
		console.log(decodeURIComponent(arraylist[0][0]));
		console.log(arraylist[0][2]);
				
		// Top 1 Loser
		console.log(decodeURIComponent(arraylist[arraylist.length-1][0]));
		console.log(arraylist[arraylist.length-1][2]);
		
		var outputData = [
			[decodeURIComponent(arraylist[0][0]),arraylist[0][1],arraylist[0][2],arraylist[0][3]],
			[decodeURIComponent(arraylist[1][0]),arraylist[1][1],arraylist[1][2],arraylist[1][3]],
			[decodeURIComponent(arraylist[2][0]),arraylist[2][1],arraylist[2][2],arraylist[2][3]],
			[decodeURIComponent(arraylist[3][0]),arraylist[3][1],arraylist[3][2],arraylist[3][3]],
			[decodeURIComponent(arraylist[4][0]),arraylist[4][1],arraylist[4][2],arraylist[4][3]],
			[decodeURIComponent(arraylist[arraylist.length-1][0]),arraylist[arraylist.length-1][1],arraylist[arraylist.length-1][2],arraylist[arraylist.length-1][3]],
			[decodeURIComponent(arraylist[arraylist.length-2][0]),arraylist[arraylist.length-2][1],arraylist[arraylist.length-2][2],arraylist[arraylist.length-2][3]],
			[decodeURIComponent(arraylist[arraylist.length-3][0]),arraylist[arraylist.length-3][1],arraylist[arraylist.length-3][2],arraylist[arraylist.length-3][3]],
			[decodeURIComponent(arraylist[arraylist.length-4][0]),arraylist[arraylist.length-4][1],arraylist[arraylist.length-4][2],arraylist[arraylist.length-4][3]],
			[decodeURIComponent(arraylist[arraylist.length-5][0]),arraylist[arraylist.length-5][1],arraylist[arraylist.length-5][2],arraylist[arraylist.length-5][3]],
			];
		
		testLog(outputData);

	});
}

var testLog = function(outputData) {
	res1.setHeader('Content-Type', 'image/png');
	var img = new Canvas.Image;
	img.onload = function(){ return draw(img,outputData).pngStream().pipe(res1); } 
	img.src = "bg.png";
}


//db.close();


app.listen(port);
console.log("Listening on port ", port);
