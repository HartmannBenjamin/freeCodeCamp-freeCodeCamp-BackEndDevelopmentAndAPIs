// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/:param", function (req, res) {
  let param = req.params.param;
  let dateParam = new Date();

  if (/^\d{4}[./-]\d{2}[./-]\d{2}$/.test(req.params.param)) {
    dateParam = new Date(param);
  } else {
    dateParam.setTime(param);
  }

  let resp = {};
  resp.unix = dateParam.getTime();
  resp.utc = dateParam.toUTCString();

  res.json(resp);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
