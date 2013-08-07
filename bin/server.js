#!/usr/bin/env node
var path = require("path"),
    argv = require("optimist").argv,
    why  = require(path.join(__dirname, "../lib/why.js"))
;

// Allow a custom web application root to be set:
if(argv.root && typeof argv.root == "string") {
  why.webRoot(argv.root);
}