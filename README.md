# why

Off-load expensive rendering operations to your back-end cloud servers,
using the magic of nodejs.

Never again will you suffer from cross-browser inconsistencies, with
this powerful application server (or "app server", if you prefer), all
users, everywhere, get an 100% equal rendered page.

### Demo: http://why-demo.herokuapp.com/

## But how??

`why` (name pending) acts as a proxy to your static web application, by
capturing requests, and dispatching them to a phantomjs instance, which
captures a screenshot of your webpage, in its ideal webkit environment,
at the correct dimensions for the user's device, and embeds it in a light-weight
frame.

#### Pros:
- it's ajaxy
- faster
- webkit
- nodejs?!
- retina ready probably
- web scale
- renders cross-browser issues a thing of the past
- webkit

#### Cons:
- none

## Are you serious?

Well, it does actually work. Yes, you can even click links...mostly.

<img src="http://i.imgur.com/GYeamse.gif" width="256">

## Usage:

1. Install nodejs, npm.
2. Install phantomjs, make sure it's in your `$PATH`: `$ npm -g install phantomjs`
3. Clone this repo: `$ git clone https://github.com/filp/why.git`
4. Install dependencies: `$ cd why && npm install`
4. Start the server: `$ cd why && bin/server.js [--port 8181 --privPort 9292 --root /path/to/your/app]`
4. Check it :cat:

## To-do:

- Add a kick-ass example web app