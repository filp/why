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

var webRoot   = path.join(__dirname, "../web"),
    cacheDir  = path.join(__dirname, "../cache")
    linkMatch = {}
;

/** 
 * Generate a certified (prolly) unique id
 */
function uniqId() {
  return (Date.now()).toString(36);
}

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
    console.log("why : app (private) server hit:" + req.url);

    // Serve static files:
    req.addListener("end", file.serve.bind(file, req, res)).resume();
  });

  // And the public-facing server that will deliver the goods:
  var pubServer = http.createServer(function(req, res) {
    var query = url.parse(req.url, true).query;

    console.log("why: public server hit:" + req.url);

    if(query.links && query.id) {
      // This is a request from the injected script, sending information on
      // links in the page. This is really silly, and could be done a bit
      // more cleanly, but it's hacky and fun, so might aswell indulge since
      // there's no harm done.
      // don't look at this either
      if(!linkMatch[query.id]) {
        linkMatch[query.id] = {};
      }

      linkMatch[query.id].links = JSON.parse(unescape(query.links));
      linkMatch[query.id].done  = true;
      linkMatch[query.id].onDone && linkMatch[query.id].onDone();
    }
    else if(query.path && query.w) {
    // This is a request from within the frame, asking for another page:
    
      // ask phantomjs to capture dat:
      var id      = uniqId(),
          width   = Math.min(parseInt(query.w), 1920),
          pageUrl = "http://localhost:" + privPort + query.path + "#" + port + ";" + id,
          options = {
            script: function() {
              // this is absolutely awful, stay away don't look
              var _hash     = window.location.hash.substr(1).split(";");
              var _links    = document.getElementsByTagName("a");
              var _linksRef = [];
              var _x        = new XMLHttpRequest;

              for(var _i = 0; _i < _links.length; _i++) {
                var _l = _links[_i];
                _linksRef.push([_l.getAttribute("href"), _l.offsetLeft, _l.offsetTop, _l.offsetWidth, _l.offsetHeight]);
              };

              _x.open("GET", "http://localhost:" + _hash[0] + "/?links=" + encodeURIComponent(JSON.stringify(_linksRef)) + "&id=" + _hash[1], true);
              _x.send();
            },
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
            var payload = {
                body: "data:image/png;base64," + body.toString("base64"),
                links: []
              },
              onDone = function() {
                payload.links = linkMatch[id].links;
                res.end(JSON.stringify(payload));

                delete linkMatch[id];
              }
            ;

            // if we have info on links already, cool, else, hold up a bit:
            // don't look at this bit
            if(linkMatch[id] && linkMatch[id].done) {
              onDone();
            } else { linkMatch[id] = { onDone: onDone }; }

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

  console.log("why : started public server on http://localhost:" + port);
};