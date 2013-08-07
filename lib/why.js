/**
 * why
 * 
 * the webscale solution to cross-browser rendering
 * inconsistencies (AKA chrome-on-the-cloud)
 *
 * @author  Filipe Dobreira <https://github.com/filp>
 */
var url     = require("url"),
    path    = require("path"),
    fs      = require("fs"),
    buffer  = require("buffer"),
    http    = require("http"),
    nstatic = require("node-static"),
    webshot = require("webshot")
;

"use strict";

var webRoot  = path.join(__dirname, "../web"),
    cacheDir = path.join(__dirname, "../cache")
;

/**
 * Set the location of the private web-app.
 * 
 * @param  {String} path
 */
exports.webRoot = function(root) {
  root = path.resolve(root);

  if(!fs.existsSync(root) || !fs.lstatSync(root).isDirectory()) {
    throw new Error("application root must be a valid directory");
  }

  return webRoot = root;
};

/**
 * Starts the why services and starts answering to
 * requests!
 *
 * @param {Int} port    The public-facing server port
 * @param {Int} priPort The private app server's port
 */
exports.start = function(port, privPort) {
  // The full path to the frame html:
  var framePath = path.join(__dirname, "asset/frame.html");

  // Start the private app server:
  var file       = new nstatic.Server(webRoot);
  var appServer  = http.createServer(function(req, res) {
    console.log("App server hit:" + req.url);

    // Serve static files:
    req.addListener("end", file.serve.bind(file, req, res)).resume();
  });

  // And the public-facing server that will deliver the goods:
  var pubServer = http.createServer(function(req, res) {
    var query = url.parse(req.url, true).query;

    console.log("Public server hit:" + req.url);

    // This is a request from within the frame, asking for another page:
    if(query.path && query.w) {
      // ask phantomjs to capture dat:
      var width   = Math.min(parseInt(query.w), 1920),
          pageUrl = "http://localhost:" + privPort + query.path,
          options = {
            screenSize: {
              width: width,
              height: 720
            },
            shotSize: {
              width: width,
              height: "all"
            }
          }
      ;

      webshot(pageUrl, options, function(err, imageStream) {
        if(err) {
          // something went belly up:
          console.log(err);

          // whatever
          res.end();
        } else {
          var body = new Buffer("");

          // base64 encode the whole thing and ship it back to the client
          // did I mention this isn't safe for production
          imageStream.on("data", function(chunk) {
            body = Buffer.concat([body, chunk]);
          });

          // alright
          imageStream.on("end", function() {
            body = "data:image/png;base64," + body.toString("base64");
            res.end(body);
          });
        }
      });

    } else {
      // Send the initial frame:
      res.writeHead(200, { 
        "Content-Type":   "text/html",
        "Content-Length": fs.statSync(framePath).size
      });

      // i could pipe this
      res.end(fs.readFileSync(framePath));
    }
  });

  appServer.listen(privPort);
  pubServer.listen(port);
};