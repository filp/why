/**
 * why
 * 
 * the webscale solution to cross-browser rendering
 * inconsistencies (AKA chrome-on-the-cloud)
 *
 * @author  Filipe Dobreira <https://github.com/filp>
 */
var path    = require("path"),
    fs      = require("fs"),
    webshot = require("webshot"),
    nstatic = require("node-static")
;

"use strict";

var webRoot = path.join(__dirname, "..", "web");

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