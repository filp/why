#!/usr/bin/env node
var path = require("path"),
    argv = require("optimist").argv,
    why  = require(path.join(__dirname, "../lib/why.js"))
;

// Allow a custom web application root to be set:
if(argv.root && typeof argv.root == "string") {
  why.webRoot(argv.root);
}

// Allow a --port and --privPort argument for specifying the
// public and private ports respectivelly, then get going:
why.start(parseInt(argv.port) || 8181, parseInt(argv.privPort) || 9292);